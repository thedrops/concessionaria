import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as fs from "fs";
import * as path from "path";

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

    const cars = await prisma.car.findMany({
      where: whereFilter,
      orderBy: [{ brand: "asc" }, { model: "asc" }],
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

    // Criar PDF
    const doc = new jsPDF();

    // Carregar logo
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    let logoBase64 = "";
    try {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch (error) {
      console.error("Erro ao carregar logo:", error);
    }

    // Adicionar cabeçalho com logo e título
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 15, 10, 30, 30);
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ISRAEL VEÍCULOS E MOTOS LTDA", 50, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Estoque", 50, 28);

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    let currentY = 55;

    // Iterar por marca
    Object.keys(carsByBrand)
      .sort()
      .forEach((brand) => {
        // Verificar se precisa de nova página
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        // Título da marca
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(brand.toUpperCase(), 15, currentY);
        currentY += 8;

        // Preparar dados dos carros dessa marca
        const tableData = carsByBrand[brand].map((car) => {
          // Buscar dados da API externa se disponível
          const vehicleData = car.plate ? vehicleDataMap.get(car.plate) : null;
          let anoFabricacao = car.year;
          let anoModelo = car.modelYear || car.year;

          // Extrair anos da API externa se disponível
          if (vehicleData) {
            const apiData = vehicleData as any;
            if (apiData.extra?.ano_fabricacao) {
              anoFabricacao = apiData.extra.ano_fabricacao;
            } else if (apiData.ano) {
              anoFabricacao = apiData.ano;
            }

            if (apiData.extra?.ano_modelo) {
              anoModelo = apiData.extra.ano_modelo;
            } else if (apiData.anoModelo) {
              anoModelo = apiData.anoModelo;
            }
          }

          return [
            car.model,
            car.plate || "Sem placa",
            car.color || "N/I",
            anoFabricacao,
            anoModelo,
            formatCurrency(car.price),
          ];
        });

        // Adicionar tabela
        autoTable(doc, {
          startY: currentY,
          head: [["Modelo", "Placa", "Cor", "Ano Fab.", "Ano Modelo", "Valor"]],
          body: tableData,
          theme: "grid",
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25, halign: "center" },
            2: { cellWidth: 20, halign: "center" },
            3: { cellWidth: 20, halign: "center" },
            4: { cellWidth: 20, halign: "center" },
            5: { cellWidth: 30, halign: "right" },
          },
          margin: { left: 15, right: 15 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      });

    // Gerar buffer do PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Define nome do arquivo baseado no filtro
    let fileName = "carros-disponiveis";
    if (consignadoFilter === "sim") {
      fileName = "carros-consignados";
    } else if (consignadoFilter === "nao") {
      fileName = "carros-nao-consignados";
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}-${
          new Date().toISOString().split("T")[0]
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
