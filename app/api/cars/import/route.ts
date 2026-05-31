import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface CsvRow {
  placa: string;
  marca: string;
  modelo: string;
  categoria?: string;
  cambio?: string;
  combustivel?: string;
  observacoes?: string;
  valor: string;
}

function parsePrice(valor: string): number | null {
  if (!valor) return null;
  const cleaned = valor
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

async function fetchPlateData(plate: string): Promise<any> {
  if (process.env.NODE_ENV === "development") {
    await new Promise((r) => setTimeout(r, 50));
    return { ano: "2024", anoModelo: "2024", cor: "", extra: {} };
  }

  const baseUrl = process.env.EXTERNAL_API_URL;
  const secretKey = process.env.EXTERNAL_API_KEY;
  if (!baseUrl || !secretKey) return null;

  try {
    const response = await fetch(
      `${baseUrl}/consulta/${encodeURIComponent(plate)}/${secretKey}`,
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows }: { rows: CsvRow[] } = await request.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma linha válida no CSV" },
        { status: 400 },
      );
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        const plate = row.placa?.replace(/[^A-Z0-9]/gi, "").toUpperCase();

        if (!plate) {
          errors++;
          continue;
        }

        const existing = await prisma.car.findFirst({
          where: { plate: { equals: plate, mode: "insensitive" } },
        });

        if (existing) {
          skipped++;
          continue;
        }

        const apiData = await fetchPlateData(plate);

        const price = parsePrice(row.valor);
        if (!price) {
          errors++;
          continue;
        }

        const brand = row.marca?.trim() || apiData?.MARCA || apiData?.marca || "";
        const model = row.modelo?.trim() || apiData?.MODELO || apiData?.modelo || "";
        const year = apiData?.ano || "";

        if (!brand || !model || !year) {
          errors++;
          continue;
        }

        await prisma.car.create({
          data: {
            plate,
            brand,
            model,
            year,
            modelYear: apiData?.anoModelo || year,
            version: apiData?.VERSAO || apiData?.versao || null,
            transmission:
              row.cambio?.trim() ||
              apiData?.extra?.caixa_cambio ||
              null,
            fuel:
              row.combustivel?.trim() ||
              apiData?.extra?.combustivel ||
              null,
            color: apiData?.cor || null,
            passengers: apiData?.extra?.quantidade_passageiro
              ? parseInt(apiData.extra.quantidade_passageiro)
              : null,
            price,
            additionalInfo: row.observacoes?.trim() || null,
            description: "",
            images: [],
            status: "AVAILABLE",
            consignado: false,
          },
        });

        created++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({ created, skipped, errors });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
