"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteCar } from "@/app/(admin)/admin/carros/actions";

interface DeleteCarButtonProps {
  carId: string;
  carName: string;
}

export default function DeleteCarButton({
  carId,
  carName,
}: DeleteCarButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteCar(carId);

      if (result.success) {
        router.refresh();
        setShowConfirm(false);
      } else {
        alert(result.error || "Erro ao excluir o carro");
      }
    } catch (error) {
      alert("Erro ao excluir o carro");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-800"
        title="Excluir"
        disabled={isDeleting}
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o carro <strong>{carName}</strong>?
              Esta ação não pode ser desfeita e todas as imagens serão
              removidas.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
