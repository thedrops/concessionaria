"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CarCard from "@/components/public/CarCard";
import { Car } from "@prisma/client";
import { Loader2 } from "lucide-react";

export default function CatalogGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showAll, setShowAll] = useState(
    searchParams.get("showAll") === "true",
  );
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchCars = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Se showAll está ativado, não pagina
        if (showAll) {
          params.set("showAll", "true");
        } else {
          params.set("page", pageNum.toString());
          params.set("limit", "12");
        }

        if (searchParams.get("search"))
          params.set("search", searchParams.get("search")!);
        if (searchParams.get("marca"))
          params.set("marca", searchParams.get("marca")!);
        if (searchParams.get("anoMin"))
          params.set("anoMin", searchParams.get("anoMin")!);
        if (searchParams.get("anoMax"))
          params.set("anoMax", searchParams.get("anoMax")!);
        if (searchParams.get("precoMin"))
          params.set("precoMin", searchParams.get("precoMin")!);
        if (searchParams.get("precoMax"))
          params.set("precoMax", searchParams.get("precoMax")!);

        const response = await fetch(`/api/cars/catalog?${params}`);
        const data = await response.json();

        if (reset) {
          setCars(data.cars);
        } else {
          setCars((prev) => [...prev, ...data.cars]);
        }

        // Se showAll está ativado, não há mais páginas
        if (showAll) {
          setHasMore(false);
        } else {
          setHasMore(data.pagination.hasMore);
        }
        setInitialLoad(false);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, searchParams, showAll],
  );

  // Reset quando filtros mudam
  useEffect(() => {
    setCars([]);
    setPage(1);
    setHasMore(true);
    fetchCars(1, true);
  }, [searchParams, showAll]);

  // Toggle para ver todo o estoque
  const handleShowAllToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    const newShowAll = !showAll;

    if (newShowAll) {
      params.set("showAll", "true");
    } else {
      params.delete("showAll");
    }

    setShowAll(newShowAll);
    router.push(`/catalogo?${params.toString()}`);
  };

  // Intersection Observer para infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  // Carregar mais quando page muda
  useEffect(() => {
    if (page > 1) {
      fetchCars(page);
    }
  }, [page]);

  if (initialLoad) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cars.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-secondary-600">
          Nenhum veículo encontrado com os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Checkbox para ver todo o estoque */}
      <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="showAll"
            checked={showAll}
            onChange={handleShowAllToggle}
            className="w-5 h-5 text-primary-500 border-secondary-300 rounded focus:ring-primary-500 cursor-pointer"
          />
          <label
            htmlFor="showAll"
            className="text-sm font-medium text-secondary-700 cursor-pointer select-none"
          >
            Deseja ver todo o estoque?
          </label>
        </div>
        {showAll && (
          <span className="text-sm text-secondary-500">
            Exibindo todos os {cars.length} veículos
          </span>
        )}
        {!showAll && cars.length > 0 && (
          <span className="text-sm text-secondary-500">Paginação ativada</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-secondary-600">
            Carregando mais veículos...
          </span>
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-10 w-full" />
      )}

      {/* End message */}
      {!hasMore && cars.length > 0 && (
        <div className="text-center py-8 text-secondary-500">
          Você visualizou todos os veículos disponíveis
        </div>
      )}
    </>
  );
}
