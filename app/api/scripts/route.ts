import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const scriptSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  content: z.string().min(1, "Conteúdo do script é obrigatório"),
  position: z.enum(["HEAD", "BODY_START", "BODY_END"]),
  isActive: z.boolean().optional().default(true),
  description: z.string().optional().nullable(),
  order: z.number().optional().default(0),
});

// GET - Buscar scripts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const position = searchParams.get("position") as string | null;

    // Se for requisição admin, verificar autenticação
    if (isAdmin) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Retornar todos os scripts para o admin
      const scripts = await prisma.customScript.findMany({
        orderBy: [{ position: "asc" }, { order: "asc" }],
      });

      return NextResponse.json(scripts);
    }

    // Para requisições públicas, retornar apenas scripts ativos
    const whereClause: any = { isActive: true };

    if (position) {
      whereClause.position = position;
    }

    const scripts = await prisma.customScript.findMany({
      where: whereClause,
      orderBy: { order: "asc" },
      select: {
        id: true,
        content: true,
        position: true,
        order: true,
      },
    });

    return NextResponse.json(scripts);
  } catch (error) {
    console.error("Error fetching scripts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Criar novo script
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = scriptSchema.parse(body);

    const script = await prisma.customScript.create({
      data: validatedData,
    });

    return NextResponse.json(script, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error creating script:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
