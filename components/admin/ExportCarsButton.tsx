"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportCarsButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (filter: "todos" | "sim" | "nao") => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const url =
        filter === "todos"
          ? "/api/export/cars"
          : `/api/export/cars?consignado=${filter}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erro ao exportar");
      }

      // Criar download do arquivo
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `carros-${new Date().toISOString().split("T")[0]}.xlsx`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert("Erro ao exportar carros");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        <Download className="w-5 h-5" />
        {isExporting ? "Exportando..." : "Exportar"}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                onClick={() => handleExport("todos")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exportar Todos
              </button>
              <button
                onClick={() => handleExport("sim")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exportar Consignados
              </button>
              <button
                onClick={() => handleExport("nao")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exportar Não Consignados
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
