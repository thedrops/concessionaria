"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function PlateSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plate, setPlate] = useState(searchParams.get("placa") || "");

  useEffect(() => {
    setPlate(searchParams.get("placa") || "");
  }, [searchParams]);

  // Função para aplicar máscara de placa brasileira
  const applyPlateMask = (value: string) => {
    // Remove tudo que não é letra ou número
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Limita a 7 caracteres
    cleaned = cleaned.slice(0, 7);

    // Formato antigo: AAA-9999 (3 letras + 4 números)
    // Formato Mercosul: AAA9A99 (3 letras + 1 número + 1 letra + 2 números)
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length >= 4) {
      const fourthChar = cleaned[3];
      const fifthChar = cleaned.length >= 5 ? cleaned[4] : "";

      // Se o 4º caractere é número e o 5º também é número (ou ainda não foi digitado)
      // então é formato antigo
      if (/[0-9]/.test(fourthChar) && (!fifthChar || /[0-9]/.test(fifthChar))) {
        // Formato antigo: AAA-9999
        return cleaned.slice(0, 3) + "-" + cleaned.slice(3);
      } else {
        // Formato Mercosul: AAA9A99 (sem hífen)
        return cleaned;
      }
    }

    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPlateMask(e.target.value);
    setPlate(maskedValue);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (plate) {
      // Remove a máscara para buscar
      const cleanPlate = plate.replace(/[^A-Z0-9]/g, "");
      params.set("placa", cleanPlate);
      params.delete("page"); // Reset pagination on search
    } else {
      params.delete("placa");
    }

    router.push(`/admin/carros?${params.toString()}`);
  };

  const handleClear = () => {
    setPlate("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("placa");
    router.push(`/admin/carros?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={plate}
          onChange={handleChange}
          placeholder="Buscar por placa (ex: ABC-1234 ou ABC1D23)"
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={8} // 7 caracteres + 1 hífen
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {plate && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Buscar
      </button>
    </form>
  );
}
