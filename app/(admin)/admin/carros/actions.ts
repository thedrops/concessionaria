"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFile } from "@/lib/storage";

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
      console.log("[DELETE CAR ACTION] Modo: STORAGE LOCAL");

      for (let i = 0; i < car.images.length; i++) {
        const imageUrl = car.images[i];
        console.log(
          `[DELETE CAR ACTION] Processando imagem ${i + 1}/${car.images.length}:`,
          imageUrl,
        );

        try {
          const result = await deleteUploadedFile(imageUrl);

          if (result.deleted) {
            console.log(
              "[DELETE CAR ACTION] Arquivo local deletado com sucesso",
            );
          } else {
            console.log(
              "[DELETE CAR ACTION] Arquivo local nao removido:",
              result.reason,
            );
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

export async function deleteCarsBulk(carIds: string[]) {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Não autorizado" };

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN") {
      return {
        success: false,
        error: "Apenas administradores podem excluir carros",
      };
    }

    if (!carIds || carIds.length === 0) {
      return { success: false, error: "Nenhum carro selecionado" };
    }

    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      select: { id: true, images: true },
    });

    for (const car of cars) {
      for (const imageUrl of car.images ?? []) {
        try {
          await deleteUploadedFile(imageUrl);
        } catch {
          // continue - nao bloquear exclusao por falha de arquivo
        }
      }
    }

    await prisma.car.deleteMany({ where: { id: { in: carIds } } });

    revalidatePath("/admin/carros");

    return { success: true, deleted: cars.length };
  } catch {
    return { success: false, error: "Erro ao excluir os carros" };
  }
}
