import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

interface PageProps {
  searchParams: { page?: string };
}

export default async function CarsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  const [cars, totalCars] = await Promise.all([
    prisma.car.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    }),
    prisma.car.count(),
  ]);

  const totalPages = Math.ceil(totalCars / perPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carros</h1>
          <p className="text-gray-600 mt-1">Gerencie o estoque de veículos</p>
        </div>
        <Link
          href="/admin/carros/novo"
          className="flex items-center gap-2  bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-600/90 transition-colors"
        >
          <Plus className="w-5 h-5 " />
          Cadastrar Carro
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total de Carros</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalCars}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Disponíveis</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {cars.filter((c) => c.status === "AVAILABLE").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Vendidos</h3>
          <p className="text-3xl font-bold text-gray-600 mt-2">
            {cars.filter((c) => c.status === "SOLD").length}
          </p>
        </div>
      </div>

      {/* Cars Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
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
                          src={car.images[0]}
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
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Link
                href={`/admin/carros?page=${Math.max(1, page - 1)}`}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                  page === 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Anterior
              </Link>
              <Link
                href={`/admin/carros?page=${Math.min(totalPages, page + 1)}`}
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
                    href={`/admin/carros?page=${Math.max(1, page - 1)}`}
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
                          href={`/admin/carros?page=${pageNum}`}
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
                    href={`/admin/carros?page=${Math.min(totalPages, page + 1)}`}
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
