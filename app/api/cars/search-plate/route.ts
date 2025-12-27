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

    // Simular busca em API externa
    // TODO: Integrar com API real (FIPE, Consulta Placa, etc)

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
  } catch (error) {
    console.error("Error searching plate:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da placa. Tente novamente." },
      { status: 500 },
    );
  }
}
