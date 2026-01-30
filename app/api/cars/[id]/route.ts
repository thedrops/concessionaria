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

    // Sanitizar placa removendo hífen e espaços
    if (validatedData.plate) {
      validatedData.plate = validatedData.plate
        .replace(/[^A-Z0-9]/gi, "")
        .toUpperCase();
    }

    // Atualizar o carro
    const car = await prisma.car.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Se houver imagens, sincronizar com a tabela CarImage
    if (validatedData.images && validatedData.images.length > 0) {
      // Deletar imagens antigas
      await prisma.carImage.deleteMany({
        where: { carId: params.id },
      });

      // Criar novas imagens com ordem
      const imageCreateData = validatedData.images.map((url, index) => ({
        carId: params.id,
        url,
        order: index,
      }));

      await prisma.carImage.createMany({
        data: imageCreateData,
      });
    }

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
  console.log("[DELETE CAR] Iniciando exclusão do carro ID:", params.id);

  try {
    console.log("[DELETE CAR] Verificando autenticação...");
    const session = await auth();

    // Verifica se está autenticado
    if (!session) {
      console.log("[DELETE CAR] ERRO: Usuário não autenticado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    console.log("[DELETE CAR] Usuário autenticado:", session.user?.email);

    // Verifica se é administrador
    console.log("[DELETE CAR] Verificando permissão de administrador...");
    const userRole = (session.user as any)?.role;
    console.log("[DELETE CAR] Role do usuário:", userRole);

    if (userRole !== "ADMIN") {
      console.log("[DELETE CAR] ERRO: Usuário não é administrador");
      return NextResponse.json(
        {
          error: "Apenas administradores podem excluir carros",
        },
        { status: 403 },
      );
    }

    // Busca o carro para pegar as imagens
    console.log("[DELETE CAR] Buscando dados do carro no banco...");
    const car = await prisma.car.findUnique({
      where: { id: params.id },
      select: { images: true },
    });

    if (!car) {
      console.log("[DELETE CAR] ERRO: Carro não encontrado no banco");
      return NextResponse.json(
        {
          error: "Carro não encontrado",
        },
        { status: 404 },
      );
    }

    console.log(
      "[DELETE CAR] Carro encontrado com",
      car.images?.length || 0,
      "imagem(ns)",
    );

    // Deleta as imagens do storage
    if (car.images && car.images.length > 0) {
      console.log(
        "[DELETE CAR] Iniciando exclusão de",
        car.images.length,
        "imagem(ns)...",
      );
      console.log(
        "[DELETE CAR] Modo:",
        isDev ? "DESENVOLVIMENTO (local)" : "PRODUÇÃO (Supabase)",
      );

      for (let i = 0; i < car.images.length; i++) {
        const imageUrl = car.images[i];
        console.log(
          `[DELETE CAR] Processando imagem ${i + 1}/${car.images.length}:`,
          imageUrl,
        );

        try {
          if (isDev) {
            console.log("[DELETE CAR] Deletando do filesystem local...");
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

            console.log("[DELETE CAR] Caminho do arquivo:", filepath);

            if (existsSync(filepath)) {
              await unlink(filepath);
              console.log("[DELETE CAR] ✓ Arquivo deletado com sucesso");
            } else {
              console.log(
                "[DELETE CAR] ⚠ Arquivo não encontrado no filesystem",
              );
            }
          } else {
            // MODO PRODUÇÃO: Remove do Supabase Storage
            console.log("[DELETE CAR] Deletando do Supabase Storage...");
            // Extrai o caminho do arquivo da URL do Supabase
            let filename = imageUrl;

            // Se for URL completa do Supabase, extrai apenas o caminho
            if (imageUrl.includes("supabase.co")) {
              console.log(
                "[DELETE CAR] URL completa detectada, extraindo path...",
              );
              const url = new URL(imageUrl);
              const pathParts = url.pathname.split("/");
              // Remove /storage/v1/object/public/car-images/ da URL
              filename = pathParts
                .slice(pathParts.indexOf("car-images") + 1)
                .join("/");
              console.log("[DELETE CAR] Path extraído:", filename);
            }

            // Se já tiver o prefixo cars/, usa direto
            if (!filename.startsWith("cars/")) {
              filename = `cars/${filename}`;
              console.log("[DELETE CAR] Prefixo cars/ adicionado:", filename);
            }

            console.log(
              "[DELETE CAR] Tentando remover do bucket car-images:",
              filename,
            );

            const { error } = await supabase!.storage
              .from("car-images")
              .remove([filename]);

            if (error) {
              console.error(
                "[DELETE CAR] ✗ Erro ao deletar imagem do Supabase:",
                error,
              );
              // Continua mesmo com erro, para não bloquear a exclusão do carro
            } else {
              console.log(
                "[DELETE CAR] ✓ Imagem deletada do Supabase com sucesso",
              );
            }
          }
        } catch (error) {
          console.error(
            `[DELETE CAR] ✗ ERRO ao processar imagem ${i + 1}:`,
            error,
          );
          console.error(
            "[DELETE CAR] Stack trace:",
            error instanceof Error ? error.stack : "N/A",
          );
          // Continua mesmo com erro, para não bloquear a exclusão do carro
        }
      }
      console.log("[DELETE CAR] Finalizado processamento de todas as imagens");
    } else {
      console.log("[DELETE CAR] Nenhuma imagem para deletar");
    }

    // Deleta o carro do banco de dados
    console.log("[DELETE CAR] Deletando carro do banco de dados...");
    await prisma.car.delete({
      where: { id: params.id },
    });

    console.log("[DELETE CAR] ✓ Carro deletado com sucesso do banco de dados");
    console.log(
      "[DELETE CAR] ========== EXCLUSÃO CONCLUÍDA COM SUCESSO ==========",
    );

    return NextResponse.json({
      success: true,
      message: "Carro excluído com sucesso",
    });
  } catch (error) {
    console.error("[DELETE CAR] ========== ERRO FATAL NA EXCLUSÃO ==========");
    console.error(
      "[DELETE CAR] Tipo do erro:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "[DELETE CAR] Mensagem:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "[DELETE CAR] Stack trace:",
      error instanceof Error ? error.stack : "N/A",
    );
    console.error("[DELETE CAR] Erro completo:", error);

    return NextResponse.json(
      { error: "Erro ao excluir o carro" },
      { status: 500 },
    );
  }
}
