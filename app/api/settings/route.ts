import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const settingsSchema = z.object({
  whatsappNumber: z.string().min(10, "Número inválido"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  companyEmail: z.string().email("Email inválido").optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  facebookUrl: z.string().url("URL inválida").optional().nullable(),
  instagramUrl: z.string().url("URL inválida").optional().nullable(),
});

// GET - Buscar configurações (público)
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();

    // Se não existir configuração, criar uma padrão
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          whatsappNumber: "12974088993",
          companyName: "Israel Veículos",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Atualizar configurações (requer autenticação)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Buscar configuração existente
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      // Criar se não existir
      settings = await prisma.siteSettings.create({
        data: validatedData,
      });
    } else {
      // Atualizar existente
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: validatedData,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
