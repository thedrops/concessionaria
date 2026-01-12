"use client";

import { Download } from "lucide-react";
import { useState } from "react";

type ExportFormat = "xlsx" | "pdf";

export default function ExportCarsButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"todos" | "sim" | "nao">(
    "todos",
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterSelect = (filter: "todos" | "sim" | "nao") => {
    setSelectedFilter(filter);
    setShowMenu(false);
    setShowFormatModal(true);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setShowFormatModal(false);

    try {
      const baseUrl =
        format === "pdf" ? "/api/export/cars/pdf" : "/api/export/cars";
      const url =
        selectedFilter === "todos"
          ? baseUrl
          : `${baseUrl}?consignado=${selectedFilter}`;

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
        : `carros-${new Date().toISOString().split("T")[0]}.${format}`;

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
    <>
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
                  onClick={() => handleFilterSelect("todos")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar Todos
                </button>
                <button
                  onClick={() => handleFilterSelect("sim")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar Consignados
                </button>
                <button
                  onClick={() => handleFilterSelect("nao")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar Não Consignados
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de seleção de formato */}
      {showFormatModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center"
            onClick={() => setShowFormatModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Selecione o formato de exportação
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleExport("xlsx")}
                  disabled={isExporting}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  Exportar em XLSX (Excel)
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  Exportar em PDF
                </button>
                <button
                  onClick={() => setShowFormatModal(false)}
                  className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
