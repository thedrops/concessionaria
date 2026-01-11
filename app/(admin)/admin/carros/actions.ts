"use server";

import { revalidatePath } from "next/cache";

export async function deleteCar(carId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/cars/${carId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Erro ao excluir o carro",
      };
    }

    revalidatePath("/admin/carros");

    return {
      success: true,
      message: data.message || "Carro excluído com sucesso",
    };
  } catch (error) {
    console.error("Erro ao excluir carro:", error);
    return {
      success: false,
      error: "Erro ao excluir o carro",
    };
  }
}
