"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface MarkAsSoldButtonProps {
  carId: string;
  carName: string;
  currentStatus: string;
}

export default function MarkAsSoldButton({
  carId,
  carName,
  currentStatus,
}: MarkAsSoldButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsSold = async () => {
    const result = await Swal.fire({
      title: "Marcar como vendido",
      html: `Tem certeza que deseja marcar o veículo <br><strong>${carName}</strong><br> como vendido?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sim, marcar como vendido",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cars/${carId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "SOLD" }),
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar carro como vendido");
      }

      await Swal.fire({
        icon: "success",
        title: "Vendido!",
        text: "O veículo foi marcado como vendido com sucesso.",
        timer: 2000,
        showConfirmButton: false,
      });

      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao marcar carro como vendido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se o carro já está vendido, não mostrar o botão
  if (currentStatus === "SOLD") {
    return null;
  }

  return (
    <button
      onClick={handleMarkAsSold}
      className="text-green-600 hover:text-green-900"
      title="Marcar como vendido"
      disabled={isLoading}
    >
      <CheckCircle className="w-5 h-5" />
    </button>
  );
}
