"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
}

export default function DeleteUserButton({
  userId,
  userName,
}: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Confirmar Exclusão",
      html: `Deseja excluir o usuário <br><strong>${userName}</strong>?`,
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
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao excluir o usuário");
      }

      await Swal.fire({
        icon: "success",
        title: "Usuário excluído!",
        text: "O usuário foi excluído com sucesso.",
        timer: 2000,
        showConfirmButton: false,
      });

      router.refresh();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao excluir",
        text:
          error instanceof Error ? error.message : "Erro ao excluir o usuário",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800"
      title="Excluir"
      disabled={isDeleting}
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
