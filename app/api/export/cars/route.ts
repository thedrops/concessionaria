import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obter parâmetro de filtro da query string
    const { searchParams } = new URL(request.url);
    const consignadoFilter = searchParams.get("consignado");

    // Construir filtro baseado no parâmetro
    const whereFilter: any = { status: "AVAILABLE" };

    if (consignadoFilter === "sim") {
      whereFilter.consignado = true;
    } else if (consignadoFilter === "nao") {
      whereFilter.consignado = false;
    }
    // Se consignadoFilter for "todos" ou null, não adiciona filtro de consignado

    const cars = await prisma.car.findMany({
      where: whereFilter,
      orderBy: { brand: "asc" },
    });

    // Prepare data for Excel
    const data = cars.map((car) => ({
      Marca: car.brand,
      Modelo: car.model,
      Ano: car.year,
      "Preço (R$)": car.price,
      Status: car.status,
      Consignado: car.consignado ? "Sim" : "Não",
      Descrição: car.description,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    // Define nome da planilha baseado no filtro
    let sheetName = "Carros Disponíveis";
    let fileName = "carros-disponiveis";

    if (consignadoFilter === "sim") {
      sheetName = "Carros Consignados";
      fileName = "carros-consignados";
    } else if (consignadoFilter === "nao") {
      sheetName = "Carros Não Consignados";
      fileName = "carros-nao-consignados";
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}-${
          new Date().toISOString().split("T")[0]
        }.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
