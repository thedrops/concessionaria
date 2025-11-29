import { prisma } from "@/lib/prisma";
import CarCard from "@/components/public/CarCard";
import CatalogFilters from "@/components/public/CatalogFilters";
import { Car } from "@prisma/client/wasm";

interface CatalogPageProps {
  searchParams: {
    marca?: string;
    anoMin?: string;
    anoMax?: string;
    precoMin?: string;
    precoMax?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const filters: any = { status: "AVAILABLE" };

  if (searchParams.marca) {
    filters.brand = { contains: searchParams.marca, mode: "insensitive" };
  }

  if (searchParams.anoMin || searchParams.anoMax) {
    filters.year = {};
    if (searchParams.anoMin) filters.year.gte = parseInt(searchParams.anoMin);
    if (searchParams.anoMax) filters.year.lte = parseInt(searchParams.anoMax);
  }

  if (searchParams.precoMin || searchParams.precoMax) {
    filters.price = {};
    if (searchParams.precoMin)
      filters.price.gte = parseFloat(searchParams.precoMin);
    if (searchParams.precoMax)
      filters.price.lte = parseFloat(searchParams.precoMax);
  }

  const cars = await prisma.car.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-secondary-900 mb-8">
          Catálogo de Veículos
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <CatalogFilters />
          </aside>

          <div className="lg:col-span-3">
            {cars.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-secondary-600">
                  Nenhum veículo encontrado com os filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car: Car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
