"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, XCircle, SkipForward, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface CsvRow {
  placa: string;
  marca: string;
  modelo: string;
  categoria?: string;
  cambio?: string;
  combustivel?: string;
  observacoes?: string;
  valor: string;
}

interface VehicleDetail {
  plate: string;
  brand: string;
  model: string;
}

interface ErrorDetail {
  plate: string;
  reason: string;
}

interface ImportResult {
  created: number;
  skipped: number;
  errors: number;
  createdList: VehicleDetail[];
  skippedList: VehicleDetail[];
  errorList: ErrorDetail[];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): CsvRow[] {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());

  if (lines.length < 2) return [];

  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-záéíóúâêôãõüç]/gi, "").trim());

  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, i) => {
    const normalized = h
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "");
    headerMap[normalized] = i;
  });

  const get = (idx: number | undefined, values: string[]) =>
    idx !== undefined ? values[idx] || "" : "";

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return {
      placa: get(headerMap["placa"], values),
      marca: get(headerMap["marca"], values),
      modelo: get(headerMap["modelo"], values),
      categoria: get(headerMap["categoria"], values),
      cambio: get(headerMap["cambio"], values),
      combustivel: get(headerMap["combustivel"], values),
      observacoes: get(headerMap["observacoes"], values),
      valor: get(headerMap["valor"], values),
    };
  });
}

export default function ImportarCarsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<"created" | "skipped" | "errors" | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Selecione um arquivo .csv");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setFileName(file.name);
      setResult(null);
    };
    reader.readAsText(file, "utf-8");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleImport = async () => {
    if (rows.length === 0) return;
    setIsImporting(true);
    setResult(null);

    try {
      const response = await fetch("/api/cars/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao importar");
      }

      setResult(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao importar");
    } finally {
      setIsImporting(false);
    }
  };

  const validRows = rows.filter((r) => r.placa && r.valor);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/carros"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Importar Carros via CSV
          </h1>
          <p className="text-gray-600 mt-1">
            Cadastre múltiplos veículos a partir de uma planilha exportada em CSV
          </p>
        </div>
      </div>

      {/* Upload area */}
      {!result && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("csv-input")?.click()}
          >
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">
              Arraste o arquivo CSV aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Colunas esperadas: Placa, Marca, Modelo, Câmbio, Combustível,
              Observações, Valor
            </p>
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {fileName}
                </span>
                <span className="text-sm text-gray-500">
                  — {rows.length} linha(s) encontrada(s),{" "}
                  <span className="text-green-600 font-medium">
                    {validRows.length} válida(s)
                  </span>
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Placa", "Marca", "Modelo", "Câmbio", "Combustível", "Valor"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.slice(0, 10).map((row, i) => (
                      <tr
                        key={i}
                        className={
                          !row.placa || !row.valor ? "bg-red-50" : ""
                        }
                      >
                        <td className="px-3 py-2 font-mono font-medium text-gray-900">
                          {row.placa || (
                            <span className="text-red-500 text-xs">vazio</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{row.marca}</td>
                        <td className="px-3 py-2 text-gray-700">{row.modelo}</td>
                        <td className="px-3 py-2 text-gray-700">{row.cambio}</td>
                        <td className="px-3 py-2 text-gray-700">
                          {row.combustivel}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{row.valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 10 && (
                  <p className="text-xs text-gray-500 px-3 py-2 border-t border-gray-100">
                    + {rows.length - 10} linha(s) não exibida(s)
                  </p>
                )}
              </div>

              <button
                onClick={handleImport}
                disabled={isImporting || validRows.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importando {validRows.length} veículo(s)...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar {validRows.length} veículo(s)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Importação concluída
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => result.created > 0 && setExpandedSection(expandedSection === "created" ? null : "created")}
              disabled={result.created === 0}
              className={`flex items-center gap-4 bg-green-50 border rounded-lg p-5 text-left transition-all ${
                result.created > 0 ? "hover:border-green-400 cursor-pointer" : "cursor-default"
              } ${expandedSection === "created" ? "border-green-400 ring-2 ring-green-300" : "border-green-200"}`}
            >
              <CheckCircle className="w-10 h-10 text-green-500 shrink-0" />
              <div className="flex-1">
                <p className="text-3xl font-bold text-green-700">{result.created}</p>
                <p className="text-sm text-green-600 font-medium mt-0.5">Cadastrado(s)</p>
                {result.created > 0 && (
                  <p className="text-xs text-green-500 mt-1.5">
                    {expandedSection === "created" ? "Ocultar lista ↑" : "Ver lista ↓"}
                  </p>
                )}
              </div>
            </button>

            <button
              onClick={() => result.skipped > 0 && setExpandedSection(expandedSection === "skipped" ? null : "skipped")}
              disabled={result.skipped === 0}
              className={`flex items-center gap-4 bg-yellow-50 border rounded-lg p-5 text-left transition-all ${
                result.skipped > 0 ? "hover:border-yellow-400 cursor-pointer" : "cursor-default"
              } ${expandedSection === "skipped" ? "border-yellow-400 ring-2 ring-yellow-300" : "border-yellow-200"}`}
            >
              <SkipForward className="w-10 h-10 text-yellow-500 shrink-0" />
              <div className="flex-1">
                <p className="text-3xl font-bold text-yellow-700">{result.skipped}</p>
                <p className="text-sm text-yellow-600 font-medium mt-0.5">Ignorado(s) — já no estoque</p>
                {result.skipped > 0 && (
                  <p className="text-xs text-yellow-500 mt-1.5">
                    {expandedSection === "skipped" ? "Ocultar lista ↑" : "Ver lista ↓"}
                  </p>
                )}
              </div>
            </button>

            <button
              onClick={() => result.errors > 0 && setExpandedSection(expandedSection === "errors" ? null : "errors")}
              disabled={result.errors === 0}
              className={`flex items-center gap-4 bg-red-50 border rounded-lg p-5 text-left transition-all ${
                result.errors > 0 ? "hover:border-red-400 cursor-pointer" : "cursor-default"
              } ${expandedSection === "errors" ? "border-red-400 ring-2 ring-red-300" : "border-red-200"}`}
            >
              <XCircle className="w-10 h-10 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-3xl font-bold text-red-700">{result.errors}</p>
                <p className="text-sm text-red-600 font-medium mt-0.5">Erro(s) — não cadastrado(s)</p>
                {result.errors > 0 && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {expandedSection === "errors" ? "Ocultar lista ↑" : "Ver lista ↓"}
                  </p>
                )}
              </div>
            </button>
          </div>

          {expandedSection && (
            <div className={`rounded-lg border overflow-hidden ${
              expandedSection === "created" ? "border-green-200" :
              expandedSection === "skipped" ? "border-yellow-200" :
              "border-red-200"
            }`}>
              <div className={`px-4 py-2.5 text-sm font-medium ${
                expandedSection === "created" ? "bg-green-50 text-green-700" :
                expandedSection === "skipped" ? "bg-yellow-50 text-yellow-700" :
                "bg-red-50 text-red-700"
              }`}>
                {expandedSection === "created" && `${result.created} veículo(s) cadastrado(s)`}
                {expandedSection === "skipped" && `${result.skipped} veículo(s) já existente(s) no estoque`}
                {expandedSection === "errors" && `${result.errors} veículo(s) com erro`}
              </div>
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {expandedSection === "created" && result.createdList.map((v, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                    <span className="font-mono font-medium text-gray-900 w-24 shrink-0">{v.plate}</span>
                    <span className="text-gray-600">{v.brand} {v.model}</span>
                  </div>
                ))}
                {expandedSection === "skipped" && result.skippedList.map((v, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                    <span className="font-mono font-medium text-gray-900 w-24 shrink-0">{v.plate}</span>
                    <span className="text-gray-600">{v.brand} {v.model}</span>
                  </div>
                ))}
                {expandedSection === "errors" && result.errorList.map((v, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                    <span className="font-mono font-medium text-gray-900 w-24 shrink-0">{v.plate}</span>
                    <span className="text-red-600">{v.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/admin/carros"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Ver estoque
            </Link>
            <button
              onClick={() => {
                setRows([]);
                setFileName("");
                setResult(null);
                setExpandedSection(null);
              }}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Nova importação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
