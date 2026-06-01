import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const consignadoFilter = searchParams.get("consignado");

    const whereFilter: any = { status: "AVAILABLE" };
    if (consignadoFilter === "sim") {
      whereFilter.consignado = true;
    } else if (consignadoFilter === "nao") {
      whereFilter.consignado = false;
    }

    const cars = await prisma.car.findMany({
      where: whereFilter,
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      include: { leads: false },
    });

    const carsWithPlate = cars.filter((car) => car.plate);
    const vehicleQueries =
      carsWithPlate.length > 0
        ? await prisma.vehicleQuery.findMany({
            where: { plate: { in: carsWithPlate.map((car) => car.plate!) } },
          })
        : [];

    const vehicleDataMap = new Map();
    vehicleQueries.forEach((vq) => vehicleDataMap.set(vq.plate, vq.data));

    const headers = ["Marca", "Modelo", "Placa", "Cor", "Ano Fabricação", "Ano Modelo", "Valor (R$)"];
    const rows: string[] = [headers.join(",")];

    const carsByBrand = cars.reduce(
      (acc, car) => {
        if (!acc[car.brand]) acc[car.brand] = [];
        acc[car.brand].push(car);
        return acc;
      },
      {} as Record<string, typeof cars>,
    );

    Object.keys(carsByBrand)
      .sort()
      .forEach((brand) => {
        carsByBrand[brand].forEach((car) => {
          const vehicleData = car.plate ? vehicleDataMap.get(car.plate) : null;
          let anoFabricacao = car.year;
          let anoModelo = car.modelYear || car.year;

          if (vehicleData) {
            const apiData = vehicleData as any;
            if (apiData.extra?.ano_fabricacao) anoFabricacao = apiData.extra.ano_fabricacao;
            else if (apiData.ano) anoFabricacao = apiData.ano;
            if (apiData.extra?.ano_modelo) anoModelo = apiData.extra.ano_modelo;
            else if (apiData.anoModelo) anoModelo = apiData.anoModelo;
          }

          rows.push(
            [
              escapeCSV(brand),
              escapeCSV(car.model),
              escapeCSV(car.plate || "Sem placa"),
              escapeCSV(car.color || "N/I"),
              escapeCSV(anoFabricacao),
              escapeCSV(anoModelo),
              escapeCSV(formatCurrency(car.price)),
            ].join(","),
          );
        });
      });

    let fileName = "carros-disponiveis";
    if (consignadoFilter === "sim") fileName = "carros-consignados";
    else if (consignadoFilter === "nao") fileName = "carros-nao-consignados";

    const csv = "\uFEFF" + rows.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
