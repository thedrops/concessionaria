"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface DeleteLeadButtonProps {
  leadId: string;
  leadName: string;
}

export default function DeleteLeadButton({
  leadId,
  leadName,
}: DeleteLeadButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Confirmar Exclusão",
      html: `Deseja excluir o lead de <br><strong>${leadName}</strong>?`,
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
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Lead excluído!",
          text: "O lead foi excluído com sucesso.",
          timer: 2000,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir",
          text: data.error || "Erro ao excluir o lead",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao excluir",
        text: "Erro ao excluir o lead",
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
