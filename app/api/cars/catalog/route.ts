import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const marca = searchParams.get("marca");
    const anoMin = searchParams.get("anoMin");
    const anoMax = searchParams.get("anoMax");
    const precoMin = searchParams.get("precoMin");
    const precoMax = searchParams.get("precoMax");

    const filters: any = { status: "AVAILABLE" };

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
