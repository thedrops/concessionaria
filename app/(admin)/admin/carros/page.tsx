import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ImageOff, Upload } from "lucide-react";
import ExportCarsButton from "@/components/admin/ExportCarsButton";
import PlateSearchInput from "@/components/admin/PlateSearchInput";
import CarsTableWithBulkDelete from "@/components/admin/CarsTableWithBulkDelete";

interface PageProps {
  searchParams: {
    page?: string;
    consignado?: string;
    status?: string;
    busca?: string;
    fotos?: string;
  };
}

export default async function CarsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const consignadoFilter = searchParams.consignado;
  const statusFilter = searchParams.status;
  const buscaFilter = searchParams.busca;
  const fotosFilter = searchParams.fotos;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  // Construir filtro baseado nos parâmetros
  const whereFilter: any = {};

  // Filtro de busca geral (placa, marca, modelo, ano, valor)
  if (buscaFilter) {
    const conditions: any[] = [
      { brand: { contains: buscaFilter, mode: "insensitive" } },
      { model: { contains: buscaFilter, mode: "insensitive" } },
      { year: { contains: buscaFilter, mode: "insensitive" } },
    ];

    const cleanPlate = buscaFilter.replace(/[^A-Z0-9]/gi, "");
    if (cleanPlate) {
      conditions.push({ plate: { contains: cleanPlate, mode: "insensitive" } });
    }

    const cleanedPrice = buscaFilter.replace(/[R$\s.]/g, "").replace(",", ".");
    const parsedPrice = parseFloat(cleanedPrice);
    if (!isNaN(parsedPrice)) {
      conditions.push({ price: { equals: parsedPrice } });
    }

    whereFilter.OR = conditions;
  }

  // Filtro de status (disponível/vendido)
  if (statusFilter === "vendidos") {
    whereFilter.status = "SOLD";
  } else if (statusFilter === "disponiveis") {
    whereFilter.status = "AVAILABLE";
  }

  // Filtro de consignado (apenas se não estiver filtrando por vendidos)
  if (!statusFilter || statusFilter === "disponiveis") {
    if (consignadoFilter === "sim") {
      whereFilter.consignado = true;
    } else if (consignadoFilter === "nao") {
      whereFilter.consignado = false;
    }
  }

  // Filtro de fotos
  if (fotosFilter === "sem") {
    whereFilter.images = { isEmpty: true };
  }

  const [cars, totalCars, totalAvailable, totalSold, totalSemFotos] = await Promise.all([
    prisma.car.findMany({
      where: whereFilter,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    }),
    prisma.car.count({ where: whereFilter }),
    prisma.car.count({ where: { status: "AVAILABLE" } }),
    prisma.car.count({ where: { status: "SOLD" } }),
    prisma.car.count({ where: { images: { isEmpty: true }, status: "AVAILABLE" } }),
  ]);

  const totalPages = Math.ceil(totalCars / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Carros</h1>
          <p className="text-gray-600 mt-1">Gerencie o estoque de veículos</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <ExportCarsButton />
          <Link
            href="/admin/carros/importar"
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </Link>
          <Link
            href="/admin/carros/novo"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Carro
          </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Buscar:
        </label>
        <PlateSearchInput />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        {/* Filtro de Status */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-gray-700 min-w-[52px]">Status:</label>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/carros"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !statusFilter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </Link>
            <Link
              href="/admin/carros?status=disponiveis"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "disponiveis"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Disponíveis
            </Link>
            <Link
              href="/admin/carros?status=vendidos"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "vendidos"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Vendidos
            </Link>
          </div>
        </div>

        {/* Filtro de Consignado (apenas se não estiver em vendidos) */}
        {statusFilter !== "vendidos" && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-gray-700 min-w-[52px]">
              Consig.:
            </label>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/carros${statusFilter ? `?status=${statusFilter}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !consignadoFilter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todos
              </Link>
              <Link
                href={`/admin/carros?${statusFilter ? `status=${statusFilter}&` : ""}consignado=sim`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  consignadoFilter === "sim"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Consignados
              </Link>
              <Link
                href={`/admin/carros?${statusFilter ? `status=${statusFilter}&` : ""}consignado=nao`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  consignadoFilter === "nao"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Não Consig.
              </Link>
            </div>
          </div>
        )}

        {/* Filtro de Fotos */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-gray-700 min-w-[52px]">Fotos:</label>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/carros${statusFilter ? `?status=${statusFilter}` : ""}${consignadoFilter ? `${statusFilter ? "&" : "?"}consignado=${consignadoFilter}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !fotosFilter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </Link>
            <Link
              href={`/admin/carros?fotos=sem${statusFilter ? `&status=${statusFilter}` : ""}`}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                fotosFilter === "sem"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              <ImageOff className="w-3.5 h-3.5" />
              Sem Fotos
              {totalSemFotos > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${fotosFilter === "sem" ? "bg-white text-orange-600" : "bg-orange-500 text-white"}`}>
                  {totalSemFotos}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total de Carros</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {totalAvailable + totalSold}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Disponíveis</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {totalAvailable}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Vendidos</h3>
          <p className="text-3xl font-bold text-gray-600 mt-2">{totalSold}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-400">
          <h3 className="text-sm font-medium text-gray-600">Sem Fotos (Ocultos)</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">{totalSemFotos}</p>
          <p className="text-xs text-gray-400 mt-1">Disponíveis sem imagens</p>
        </div>
      </div>

      {/* Cars Table */}
      <CarsTableWithBulkDelete
        cars={cars}
        pagination={{ page, totalPages, totalCars, perPage, skip, consignadoFilter, statusFilter, fotosFilter, buscaFilter }}
      />
    </div>
  );
}
