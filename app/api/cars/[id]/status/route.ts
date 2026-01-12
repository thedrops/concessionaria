import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "OPERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!status || !["AVAILABLE", "SOLD"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const car = await prisma.car.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(car);
  } catch (error) {
    console.error("Erro ao atualizar status do carro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do carro" },
      { status: 500 },
    );
  }
}
