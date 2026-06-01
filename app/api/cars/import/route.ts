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
    const createdList: { plate: string; brand: string; model: string }[] = [];
    const skippedList: { plate: string; brand: string; model: string }[] = [];
    const errorList: { plate: string; reason: string }[] = [];

    for (const row of rows) {
      const rawPlate = row.placa?.replace(/[^A-Z0-9]/gi, "").toUpperCase() || "";
      try {
        const plate = rawPlate;

        if (!plate) {
          errors++;
          errorList.push({ plate: row.placa || "—", reason: "Placa inválida ou ausente" });
          continue;
        }

        const existing = await prisma.car.findFirst({
          where: { plate: { equals: plate, mode: "insensitive" } },
        });

        if (existing) {
          skipped++;
          skippedList.push({ plate, brand: existing.brand, model: existing.model });
          continue;
        }

        const apiData = await fetchPlateData(plate);

        const price = parsePrice(row.valor);
        if (!price) {
          errors++;
          errorList.push({ plate, reason: "Valor inválido ou ausente" });
          continue;
        }

        const brand = row.marca?.trim() || apiData?.MARCA || apiData?.marca || "";
        const model = row.modelo?.trim() || apiData?.MODELO || apiData?.modelo || "";
        const year = apiData?.ano || "";

        if (!brand || !model || !year) {
          errors++;
          errorList.push({ plate, reason: "Dados insuficientes — marca, modelo ou ano não encontrado" });
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
        createdList.push({ plate, brand, model });
      } catch {
        errors++;
        errorList.push({ plate: rawPlate || "—", reason: "Erro interno ao processar" });
      }
    }

    return NextResponse.json({ created, skipped, errors, createdList, skippedList, errorList });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
