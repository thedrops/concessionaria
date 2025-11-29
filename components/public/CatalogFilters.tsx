"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter } from "lucide-react";

export default function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [marca, setMarca] = useState(searchParams.get("marca") || "");
  const [anoMin, setAnoMin] = useState(searchParams.get("anoMin") || "");
  const [anoMax, setAnoMax] = useState(searchParams.get("anoMax") || "");
  const [precoMin, setPrecoMin] = useState(searchParams.get("precoMin") || "");
  const [precoMax, setPrecoMax] = useState(searchParams.get("precoMax") || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (marca) params.set("marca", marca);
    if (anoMin) params.set("anoMin", anoMin);
    if (anoMax) params.set("anoMax", anoMax);
    if (precoMin) params.set("precoMin", precoMin);
    if (precoMax) params.set("precoMax", precoMax);

    router.push(`/catalogo?${params.toString()}`);
  };

  const handleClear = () => {
    setMarca("");
    setAnoMin("");
    setAnoMax("");
    setPrecoMin("");
    setPrecoMax("");
    router.push("/catalogo");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Filter className="h-5 w-5 mr-2 text-primary-500" />
        <h2 className="text-xl font-bold text-secondary-900">Filtros</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Marca
          </label>
          <input
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex: Toyota"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Ano
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={anoMin}
              onChange={(e) => setAnoMin(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Mín"
            />
            <input
              type="number"
              value={anoMax}
              onChange={(e) => setAnoMax(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Máx"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Preço (R$)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={precoMin}
              onChange={(e) => setPrecoMin(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Mín"
            />
            <input
              type="number"
              value={precoMax}
              onChange={(e) => setPrecoMax(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Máx"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <button
            onClick={handleFilter}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition"
          >
            Aplicar
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 font-medium py-2 px-4 rounded-md transition"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}
