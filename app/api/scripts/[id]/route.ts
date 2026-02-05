import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const scriptUpdateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  content: z.string().min(1, "Conteúdo do script é obrigatório").optional(),
  position: z.enum(["HEAD", "BODY_START", "BODY_END"]).optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional().nullable(),
  order: z.number().optional(),
});

// GET - Buscar script específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const script = await prisma.customScript.findUnique({
      where: { id },
    });

    if (!script) {
      return NextResponse.json(
        { error: "Script não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(script);
  } catch (error) {
    console.error("Error fetching script:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Atualizar script
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = scriptUpdateSchema.parse(body);

    const existingScript = await prisma.customScript.findUnique({
      where: { id },
    });

    if (!existingScript) {
      return NextResponse.json(
        { error: "Script não encontrado" },
        { status: 404 },
      );
    }

    const script = await prisma.customScript.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(script);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error updating script:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Deletar script
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingScript = await prisma.customScript.findUnique({
      where: { id },
    });

    if (!existingScript) {
      return NextResponse.json(
        { error: "Script não encontrado" },
        { status: 404 },
      );
    }

    await prisma.customScript.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Script deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting script:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
