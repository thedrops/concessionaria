import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const showAll = searchParams.get("showAll") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search");
    const marca = searchParams.get("marca");
    const anoMin = searchParams.get("anoMin");
    const anoMax = searchParams.get("anoMax");
    const precoMin = searchParams.get("precoMin");
    const precoMax = searchParams.get("precoMax");

    const filters: any = { status: "AVAILABLE" };

    // Busca por texto em múltiplos campos
    if (search) {
      filters.OR = [
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { plate: { contains: search, mode: "insensitive" } },
        { year: { contains: search } },
      ];
    }

    if (marca) {
      filters.brand = { contains: marca, mode: "insensitive" };
    }

    if (anoMin || anoMax) {
      filters.year = {};
      if (anoMin) filters.year.gte = anoMin;
      if (anoMax) filters.year.lte = anoMax;
    }

    if (precoMin || precoMax) {
      filters.price = {};
      if (precoMin) filters.price.gte = parseFloat(precoMin);
      if (precoMax) filters.price.lte = parseFloat(precoMax);
    }

    // Se showAll está ativado, retorna todos os carros
    if (showAll) {
      const cars = await prisma.car.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        cars,
        pagination: {
          page: 1,
          limit: cars.length,
          totalCount: cars.length,
          totalPages: 1,
          hasMore: false,
        },
      });
    }

    const skip = (page - 1) * limit;

    const [cars, totalCount] = await Promise.all([
      prisma.car.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.car.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      cars,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
