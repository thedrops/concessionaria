import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/cars/:id/images - Atualiza a ordem das imagens
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;
    const { images } = await request.json();

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Formato de imagens inválido" },
        { status: 400 },
      );
    }

    // Verificar se o carro existe
    const car = await prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      return NextResponse.json(
        { error: "Carro não encontrado" },
        { status: 404 },
      );
    }

    // Deletar todas as imagens existentes
    await prisma.carImage.deleteMany({
      where: { carId: id },
    });

    // Criar novas imagens com a ordem especificada
    const createPromises = images.map((img: { url: string; order: number }) =>
      prisma.carImage.create({
        data: {
          carId: id,
          url: img.url,
          order: img.order,
        },
      }),
    );

    await Promise.all(createPromises);

    // Atualizar também o array de imagens no campo images (para compatibilidade)
    await prisma.car.update({
      where: { id },
      data: {
        images: images.map((img: { url: string }) => img.url),
      },
    });

    return NextResponse.json({
      message: "Ordem das imagens atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar ordem das imagens:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ordem das imagens" },
      { status: 500 },
    );
  }
}

// GET /api/cars/:id/images - Busca imagens ordenadas
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const images = await prisma.carImage.findMany({
      where: { carId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imagens" },
      { status: 500 },
    );
  }
}
