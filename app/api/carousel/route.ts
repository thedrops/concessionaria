import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const images = await prisma.carouselImage.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        image: true,
        title: true,
        link: true,
      },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
