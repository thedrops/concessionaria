"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Filter, ChevronDown } from "lucide-react";

export default function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [marca, setMarca] = useState(searchParams.get("marca") || "");
  const [anoMin, setAnoMin] = useState(searchParams.get("anoMin") || "");
  const [anoMax, setAnoMax] = useState(searchParams.get("anoMax") || "");
  const [precoMin, setPrecoMin] = useState(searchParams.get("precoMin") || "");
  const [precoMax, setPrecoMax] = useState(searchParams.get("precoMax") || "");
  const [brands, setBrands] = useState<string[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  const [showBrandsList, setShowBrandsList] = useState(false);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const brandsListRef = useRef<HTMLDivElement>(null);

  // Busca as marcas disponíveis
  useEffect(() => {
    fetch("/api/cars/brands")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data);
        setFilteredBrands(data);
      })
      .catch((err) => console.error("Error fetching brands:", err));
  }, []);

  // Filtra marcas conforme o usuário digita
  useEffect(() => {
    if (marca) {
      const filtered = brands.filter((brand) =>
        brand.toLowerCase().includes(marca.toLowerCase()),
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(brands);
    }
  }, [marca, brands]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandsListRef.current &&
        !brandsListRef.current.contains(event.target as Node) &&
        brandInputRef.current &&
        !brandInputRef.current.contains(event.target as Node)
      ) {
        setShowBrandsList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setShowBrandsList(false);
    router.push("/catalogo");
  };

  const handleBrandSelect = (brand: string) => {
    setMarca(brand);
    setShowBrandsList(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Filter className="h-5 w-5 mr-2 text-primary-500" />
        <h2 className="text-xl font-bold text-secondary-900">Filtros</h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Marca
          </label>
          <div className="relative">
            <input
              ref={brandInputRef}
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              onFocus={() => setShowBrandsList(true)}
              className="w-full px-3 py-2 pr-8 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Digite ou selecione..."
              autoComplete="off"
            />
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
          </div>

          {/* Dropdown de marcas */}
          {showBrandsList && filteredBrands.length > 0 && (
            <div
              ref={brandsListRef}
              className="absolute z-10 w-full mt-1 bg-white border border-secondary-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredBrands.map((brand) => (
                <div
                  key={brand}
                  onClick={() => handleBrandSelect(brand)}
                  className="px-3 py-2 hover:bg-primary-50 cursor-pointer transition-colors"
                >
                  {brand}
                </div>
              ))}
            </div>
          )}

          {showBrandsList && filteredBrands.length === 0 && marca && (
            <div
              ref={brandsListRef}
              className="absolute z-10 w-full mt-1 bg-white border border-secondary-300 rounded-md shadow-lg p-3 text-sm text-secondary-500"
            >
              Nenhuma marca encontrada
            </div>
          )}
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
