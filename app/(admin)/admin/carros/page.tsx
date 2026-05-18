import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { getImageUrl } from "@/lib/image-url";
import DeleteCarButton from "@/components/admin/DeleteCarButton";
import ExportCarsButton from "@/components/admin/ExportCarsButton";
import MarkAsSoldButton from "@/components/admin/MarkAsSoldButton";
import PlateSearchInput from "@/components/admin/PlateSearchInput";

interface PageProps {
  searchParams: {
    page?: string;
    consignado?: string;
    status?: string;
    placa?: string;
  };
}

export default async function CarsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const consignadoFilter = searchParams.consignado;
  const statusFilter = searchParams.status;
  const plateFilter = searchParams.placa;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  // Construir filtro baseado nos parâmetros
  const whereFilter: any = {};

  // Filtro de placa
  if (plateFilter) {
    whereFilter.plate = {
      contains: plateFilter,
      mode: "insensitive",
    };
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

  const [cars, totalCars, totalAvailable, totalSold] = await Promise.all([
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
            href="/admin/carros/novo"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Carro
          </Link>
        </div>
      </div>

      {/* Busca por Placa */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Buscar por Placa:
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Cars Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">

        {/* Mobile cards — visible on small screens only */}
        <div className="md:hidden divide-y divide-gray-200">
          {cars.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              Nenhum carro cadastrado
            </div>
          ) : (
            cars.map((car) => (
              <div key={car.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {car.images[0] ? (
                    <img
                      src={getImageUrl(car.images[0])}
                      alt={`${car.brand} ${car.model}`}
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <Eye className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ano: {car.year}
                      {car.plate && (
                        <> &bull; {car.plate.slice(0, 3)}-{car.plate.slice(3)}</>
                      )}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(car.price)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          car.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {car.status === "AVAILABLE" ? "Disponível" : "Vendido"}
                      </span>
                      {car.consignado && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                          Consignado
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {car._count.leads} lead{car._count.leads !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href={`/catalogo/${car.id}`}
                    target="_blank"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 min-h-[44px] px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    title="Ver no site"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </Link>
                  <Link
                    href={`/admin/carros/${car.id}/editar`}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 min-h-[44px] px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </Link>
                  <MarkAsSoldButton
                    carId={car.id}
                    carName={`${car.brand} ${car.model}`}
                    currentStatus={car.status}
                  />
                  <DeleteCarButton
                    carId={car.id}
                    carName={`${car.brand} ${car.model}`}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table — hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cars.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Nenhum carro cadastrado
                  </td>
                </tr>
              ) : (
                cars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {car.images[0] ? (
                        <img
                          src={getImageUrl(car.images[0])}
                          alt={`${car.brand} ${car.model}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Eye className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {car.brand}
                      </div>
                      <div className="text-sm text-gray-500">{car.model}</div>
                      {car.consignado && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                          Consignado
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {car.plate !== null
                          ? `${car.plate.slice(0, 3)}-${car.plate.slice(3)}`
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(car.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          car.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {car.status === "AVAILABLE" ? "Disponível" : "Vendido"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {car._count.leads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/catalogo/${car.id}`}
                          target="_blank"
                          className="text-gray-600 hover:text-gray-900"
                          title="Ver no site"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/carros/${car.id}/editar`}
                          className="text-primary hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <MarkAsSoldButton
                          carId={car.id}
                          carName={`${car.brand} ${car.model}`}
                          currentStatus={car.status}
                        />
                        <DeleteCarButton
                          carId={car.id}
                          carName={`${car.brand} ${car.model}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* end desktop table */}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Link
                href={`/admin/carros?page=${Math.max(1, page - 1)}${consignadoFilter ? `&consignado=${consignadoFilter}` : ""}`}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                  page === 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Anterior
              </Link>
              <Link
                href={`/admin/carros?page=${Math.min(totalPages, page + 1)}${consignadoFilter ? `&consignado=${consignadoFilter}` : ""}`}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Próxima
              </Link>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{skip + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(skip + perPage, totalCars)}
                  </span>{" "}
                  de <span className="font-medium">{totalCars}</span> resultados
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Link
                    href={`/admin/carros?page=${Math.max(1, page - 1)}${consignadoFilter ? `&consignado=${consignadoFilter}` : ""}`}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    Anterior
                  </Link>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Link
                          key={pageNum}
                          href={`/admin/carros?page=${pageNum}${consignadoFilter ? `&consignado=${consignadoFilter}` : ""}`}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === page
                              ? "z-10 bg-primary border-primary text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <span
                          key={pageNum}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <Link
                    href={`/admin/carros?page=${Math.min(totalPages, page + 1)}${consignadoFilter ? `&consignado=${consignadoFilter}` : ""}`}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  >
                    Próxima
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
