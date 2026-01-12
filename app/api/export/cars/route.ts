import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

// Função para formatar valor em reais
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

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
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      include: {
        leads: false,
      },
    });

    // Buscar dados complementares da API externa para carros com placa
    const carsWithPlate = cars.filter((car) => car.plate);
    const vehicleQueries =
      carsWithPlate.length > 0
        ? await prisma.vehicleQuery.findMany({
            where: {
              plate: {
                in: carsWithPlate.map((car) => car.plate!),
              },
            },
          })
        : [];

    // Criar mapa de dados da API por placa
    const vehicleDataMap = new Map();
    vehicleQueries.forEach((vq) => {
      vehicleDataMap.set(vq.plate, vq.data);
    });

    // Agrupar carros por marca
    const carsByBrand = cars.reduce(
      (acc, car) => {
        if (!acc[car.brand]) {
          acc[car.brand] = [];
        }
        acc[car.brand].push(car);
        return acc;
      },
      {} as Record<string, typeof cars>,
    );

    // Preparar dados no formato: Marca > Modelos com placa, ano e valor
    const data: any[] = [];

    Object.keys(carsByBrand)
      .sort()
      .forEach((brand) => {
        // Linha de cabeçalho da marca
        data.push({
          Marca: brand.toUpperCase(),
          Modelo: "",
          Placa: "",
          Cor: "",
          "Ano Fabricação": "",
          "Ano Modelo": "",
          "Valor (R$)": "",
        });

        // Adicionar os modelos dessa marca
        carsByBrand[brand].forEach((car) => {
          // Buscar dados da API externa se disponível
          const vehicleData = car.plate ? vehicleDataMap.get(car.plate) : null;
          let anoFabricacao = car.year;
          let anoModelo = car.modelYear || car.year;

          // Extrair anos da API externa se disponível
          if (vehicleData) {
            const apiData = vehicleData as any;
            // Ano de fabricação: extra.ano_fabricacao ou ano
            if (apiData.extra?.ano_fabricacao) {
              anoFabricacao = apiData.extra.ano_fabricacao;
            } else if (apiData.ano) {
              anoFabricacao = apiData.ano;
            }

            // Ano modelo: extra.ano_modelo ou anoModelo
            if (apiData.extra?.ano_modelo) {
              anoModelo = apiData.extra.ano_modelo;
            } else if (apiData.anoModelo) {
              anoModelo = apiData.anoModelo;
            }
          }

          data.push({
            Marca: "",
            Modelo: car.model,
            Placa: car.plate || "Sem placa",
            Cor: car.color || "N/I",
            "Ano Fabricação": anoFabricacao,
            "Ano Modelo": anoModelo,
            "Valor (R$)": formatCurrency(car.price),
          });
        });

        // Linha em branco entre marcas
        data.push({
          Marca: "",
          Modelo: "",
          Placa: "",
          Cor: "",
          "Ano Fabricação": "",
          "Ano Modelo": "",
          "Valor (R$)": "",
        });
      });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Estilizar cabeçalhos de marca (negrito)
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      const cell = worksheet[cellAddress];
      if (
        cell &&
        cell.v &&
        typeof cell.v === "string" &&
        cell.v === cell.v.toUpperCase() &&
        cell.v.length > 0
      ) {
        if (!cell.s) cell.s = {};
        cell.s.font = { bold: true };
      }
    }

    // Definir larguras das colunas
    worksheet["!cols"] = [
      { wch: 20 }, // Marca
      { wch: 30 }, // Modelo
      { wch: 15 }, // Placa
      { wch: 15 }, // Cor
      { wch: 15 }, // Ano Fabricação
      { wch: 12 }, // Ano Modelo
      { wch: 15 }, // Valor
    ];

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
