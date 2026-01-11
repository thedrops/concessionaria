"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

export async function deleteCar(carId: string) {
  console.log("[DELETE CAR ACTION] Iniciando exclusão do carro ID:", carId);

  try {
    // Verifica autenticação
    console.log("[DELETE CAR ACTION] Verificando autenticação...");
    const session = await auth();

    if (!session) {
      console.log("[DELETE CAR ACTION] ERRO: Usuário não autenticado");
      return {
        success: false,
        error: "Não autorizado",
      };
    }

    console.log(
      "[DELETE CAR ACTION] Usuário autenticado:",
      session.user?.email,
    );

    // Verifica se é administrador
    const userRole = (session.user as any)?.role;
    console.log("[DELETE CAR ACTION] Role do usuário:", userRole);

    if (userRole !== "ADMIN") {
      console.log("[DELETE CAR ACTION] ERRO: Usuário não é administrador");
      return {
        success: false,
        error: "Apenas administradores podem excluir carros",
      };
    }

    // Busca o carro para pegar as imagens
    console.log("[DELETE CAR ACTION] Buscando dados do carro no banco...");
    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: { images: true, brand: true, model: true },
    });

    if (!car) {
      console.log("[DELETE CAR ACTION] ERRO: Carro não encontrado no banco");
      return {
        success: false,
        error: "Carro não encontrado",
      };
    }

    console.log(
      "[DELETE CAR ACTION] Carro encontrado:",
      `${car.brand} ${car.model} com ${car.images?.length || 0} imagem(ns)`,
    );

    // Deleta as imagens do storage
    if (car.images && car.images.length > 0) {
      console.log(
        "[DELETE CAR ACTION] Iniciando exclusão de",
        car.images.length,
        "imagem(ns)...",
      );
      console.log(
        "[DELETE CAR ACTION] Modo:",
        isDev ? "DESENVOLVIMENTO (local)" : "PRODUÇÃO (Supabase)",
      );

      for (let i = 0; i < car.images.length; i++) {
        const imageUrl = car.images[i];
        console.log(
          `[DELETE CAR ACTION] Processando imagem ${i + 1}/${car.images.length}:`,
          imageUrl,
        );

        try {
          if (isDev) {
            console.log("[DELETE CAR ACTION] Deletando do filesystem local...");
            const localPath = imageUrl.replace("/uploads/cars/", "");
            const filepath = join(
              process.cwd(),
              "public",
              "uploads",
              "cars",
              localPath,
            );

            console.log("[DELETE CAR ACTION] Caminho do arquivo:", filepath);

            if (existsSync(filepath)) {
              await unlink(filepath);
              console.log("[DELETE CAR ACTION] ✓ Arquivo deletado com sucesso");
            } else {
              console.log(
                "[DELETE CAR ACTION] ⚠ Arquivo não encontrado no filesystem",
              );
            }
          } else {
            // MODO PRODUÇÃO: Remove do Supabase Storage
            console.log("[DELETE CAR ACTION] Deletando do Supabase Storage...");
            let filename = imageUrl;

            // Se for URL completa do Supabase, extrai apenas o caminho
            if (imageUrl.includes("supabase.co")) {
              console.log(
                "[DELETE CAR ACTION] URL completa detectada, extraindo path...",
              );
              const url = new URL(imageUrl);
              const pathParts = url.pathname.split("/");
              filename = pathParts
                .slice(pathParts.indexOf("car-images") + 1)
                .join("/");
              console.log("[DELETE CAR ACTION] Path extraído:", filename);
            }

            // Se já tiver o prefixo cars/, usa direto
            if (!filename.startsWith("cars/")) {
              filename = `cars/${filename}`;
              console.log(
                "[DELETE CAR ACTION] Prefixo cars/ adicionado:",
                filename,
              );
            }

            console.log(
              "[DELETE CAR ACTION] Tentando remover do bucket car-images:",
              filename,
            );

            const { error } = await supabase!.storage
              .from("car-images")
              .remove([filename]);

            if (error) {
              console.error(
                "[DELETE CAR ACTION] ✗ Erro ao deletar imagem do Supabase:",
                error,
              );
            } else {
              console.log(
                "[DELETE CAR ACTION] ✓ Imagem deletada do Supabase com sucesso",
              );
            }
          }
        } catch (error) {
          console.error(
            `[DELETE CAR ACTION] ✗ ERRO ao processar imagem ${i + 1}:`,
            error,
          );
        }
      }
      console.log(
        "[DELETE CAR ACTION] Finalizado processamento de todas as imagens",
      );
    } else {
      console.log("[DELETE CAR ACTION] Nenhuma imagem para deletar");
    }

    // Deleta o carro do banco de dados
    console.log("[DELETE CAR ACTION] Deletando carro do banco de dados...");
    await prisma.car.delete({
      where: { id: carId },
    });

    console.log(
      "[DELETE CAR ACTION] ✓ Carro deletado com sucesso do banco de dados",
    );
    console.log(
      "[DELETE CAR ACTION] ========== EXCLUSÃO CONCLUÍDA COM SUCESSO ==========",
    );

    revalidatePath("/admin/carros");

    return {
      success: true,
      message: "Carro excluído com sucesso",
    };
  } catch (error) {
    console.error(
      "[DELETE CAR ACTION] ========== ERRO FATAL NA EXCLUSÃO ==========",
    );
    console.error(
      "[DELETE CAR ACTION] Tipo do erro:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "[DELETE CAR ACTION] Mensagem:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "[DELETE CAR ACTION] Stack trace:",
      error instanceof Error ? error.stack : "N/A",
    );

    return {
      success: false,
      error: "Erro ao excluir o carro",
    };
  }
}
