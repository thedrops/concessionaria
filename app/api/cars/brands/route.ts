import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Busca todas as marcas únicas dos carros disponíveis
    const cars = await prisma.car.findMany({
      where: {
        status: "AVAILABLE",
      },
      select: {
        brand: true,
      },
      distinct: ["brand"],
      orderBy: {
        brand: "asc",
      },
    });

    const brands = cars.map((car) => car.brand);

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
