import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const images = await prisma.carouselImage.findMany({
      orderBy: { order: "asc" },
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Buscar o maior order atual
    const maxOrder = await prisma.carouselImage.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newImage = await prisma.carouselImage.create({
      data: {
        image: data.image,
        title: data.title || null,
        link: data.link || null,
        order: (maxOrder?.order || 0) + 1,
        active: data.active !== undefined ? data.active : true,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Error creating carousel image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
