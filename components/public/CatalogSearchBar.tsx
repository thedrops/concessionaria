"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function CatalogSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }

    // Manter outros filtros
    router.push(`/catalogo?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/catalogo?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="relative max-w-3xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por marca, modelo, placa, ano..."
            className="w-full pl-12 pr-24 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-md transition font-medium"
          >
            Buscar
          </button>
        </div>
      </div>
    </form>
  );
}
