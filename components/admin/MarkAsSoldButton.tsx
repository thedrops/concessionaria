"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsSold = async () => {
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

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao marcar carro como vendido");
    } finally {
      setIsLoading(false);
    }
  };

  // Se o carro já está vendido, não mostrar o botão
  if (currentStatus === "SOLD") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-green-600 hover:text-green-900"
        title="Marcar como vendido"
      >
        <CheckCircle className="w-5 h-5" />
      </button>

      {/* Modal de Confirmação */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Marcar como vendido
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Tem certeza que deseja marcar o veículo <br />
              <span className="font-semibold">{carName}</span> como vendido?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsSold}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
