"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteCar } from "@/app/(admin)/admin/carros/actions";
import Swal from "sweetalert2";

interface DeleteCarButtonProps {
  carId: string;
  carName: string;
}

export default function DeleteCarButton({
  carId,
  carName,
}: DeleteCarButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Confirmar Exclusão",
      html: `Deseja excluir <br><strong>${carName}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const deleteResult = await deleteCar(carId);

      if (deleteResult.success) {
        await Swal.fire({
          icon: "success",
          title: "Carro excluído!",
          text: "O veículo foi excluído com sucesso.",
          timer: 2000,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir",
          text: deleteResult.error || "Erro ao excluir o carro",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao excluir",
        text: "Erro ao excluir o carro",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
      title="Excluir"
      disabled={isDeleting}
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
