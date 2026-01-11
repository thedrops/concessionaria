import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mock API - Replace with real API integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plate = searchParams.get("plate");

    if (!plate) {
      return NextResponse.json(
        { error: "Placa não informada" },
        { status: 400 },
      );
    }

    // Verificar se já existe um veículo cadastrado com essa placa
    const existingCar = await prisma.car.findFirst({
      where: {
        plate: {
          equals: plate,
          mode: "insensitive",
        },
      },
    });

    // Se já existe no banco, retornar os dados do carro cadastrado
    if (existingCar) {
      return NextResponse.json({
        MARCA: existingCar.brand,
        marca: existingCar.brand,
        MODELO: existingCar.model,
        modelo: existingCar.model,
        VERSAO: existingCar.version || "",
        ano: existingCar.year,
        anoModelo: existingCar.modelYear || existingCar.year,
        cor: existingCar.color || "",
        placa: existingCar.plate,
        extra: {
          combustivel: existingCar.fuel || "",
          caixa_cambio: existingCar.transmission || "",
          quantidade_passageiro: existingCar.passengers?.toString() || "",
        },
        fromDatabase: true,
      });
    }

    // Simular busca em API externa caso esteja em modo de desenvolvimento
    if (process.env.NODE_ENV === "development") {
      // Mock response - Em produção, fazer requisição real para API externa
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simular delay

      // Exemplo de resposta mockada
      const mockData = {
        brand: "Toyota",
        model: "Corolla",
        year: "2024",
        version: "XEi 2.0",
        transmission: "Automático",
        doors: 4,
        fuel: "Flex",
        color: "Prata",
      };
      return NextResponse.json(mockData);
    }

    // Em produção, fazer requisição real para API externa
    const baseUrl = process.env.EXTERNAL_API_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "API externa não configurada" },
        { status: 500 },
      );
    }

    const secretKey = process.env.EXTERNAL_API_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Chave da API externa não configurada" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `${baseUrl}/consulta/${encodeURIComponent(plate)}/${secretKey}`,
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao consultar API externa" },
        { status: 502 },
      );
    }

    const data = await response.json();

    // Salvar os dados da api no banco de dados na tabela VehicleQuery
    await prisma.vehicleQuery.upsert({
      where: { plate },
      update: { data },
      create: {
        plate,
        data,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error searching plate:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da placa. Tente novamente." },
      { status: 500 },
    );
  }
}
