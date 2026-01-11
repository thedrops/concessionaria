import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Detecta se está em desenvolvimento sem Supabase configurado
const isDev =
  process.env.NODE_ENV === "development" &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Configurar cliente Supabase (apenas se as credenciais estiverem configuradas)
const supabase = !isDev
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  : null;

const carSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.string().min(4),
  version: z.string().nullable().optional(),
  transmission: z.string().nullable().optional(),
  doors: z.number().int().nullable().optional(),
  fuel: z.string().nullable().optional(),
  mileage: z.number().int().nullable().optional(),
  plate: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  price: z.number().positive(),
  optionals: z.string().nullable().optional(),
  additionalInfo: z.string().nullable().optional(),
  description: z.string(),
  images: z.array(z.string()),
  status: z.enum(["AVAILABLE", "SOLD"]).optional(),
  consignado: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = carSchema.parse(body);

    const car = await prisma.car.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(car);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    // Verifica se está autenticado
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verifica se é administrador
    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Apenas administradores podem excluir carros",
        },
        { status: 403 },
      );
    }

    // Busca o carro para pegar as imagens
    const car = await prisma.car.findUnique({
      where: { id: params.id },
      select: { images: true },
    });

    if (!car) {
      return NextResponse.json(
        {
          error: "Carro não encontrado",
        },
        { status: 404 },
      );
    }

    // Deleta as imagens do storage
    if (car.images && car.images.length > 0) {
      for (const imageUrl of car.images) {
        try {
          if (isDev) {
            // MODO LOCAL: Remove do filesystem
            // Extrai o nome do arquivo da URL local (ex: /uploads/cars/filename.jpg)
            const localPath = imageUrl.replace("/uploads/cars/", "");
            const filepath = join(
              process.cwd(),
              "public",
              "uploads",
              "cars",
              localPath,
            );

            if (existsSync(filepath)) {
              await unlink(filepath);
            }
          } else {
            // MODO PRODUÇÃO: Remove do Supabase Storage
            // Extrai o caminho do arquivo da URL do Supabase
            let filename = imageUrl;

            // Se for URL completa do Supabase, extrai apenas o caminho
            if (imageUrl.includes("supabase.co")) {
              const url = new URL(imageUrl);
              const pathParts = url.pathname.split("/");
              // Remove /storage/v1/object/public/car-images/ da URL
              filename = pathParts
                .slice(pathParts.indexOf("car-images") + 1)
                .join("/");
            }

            // Se já tiver o prefixo cars/, usa direto
            if (!filename.startsWith("cars/")) {
              filename = `cars/${filename}`;
            }

            const { error } = await supabase!.storage
              .from("car-images")
              .remove([filename]);

            if (error) {
              console.error("Erro ao deletar imagem do Supabase:", error);
              // Continua mesmo com erro, para não bloquear a exclusão do carro
            }
          }
        } catch (error) {
          console.error("Erro ao deletar imagem:", error);
          // Continua mesmo com erro, para não bloquear a exclusão do carro
        }
      }
    }

    // Deleta o carro do banco de dados
    await prisma.car.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Carro excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar carro:", error);
    return NextResponse.json(
      { error: "Erro ao excluir o carro" },
      { status: 500 },
    );
  }
}
