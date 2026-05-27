"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Eye, ImageOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { getImageUrl } from "@/lib/image-url";
import DeleteCarButton from "@/components/admin/DeleteCarButton";
import MarkAsSoldButton from "@/components/admin/MarkAsSoldButton";
import { deleteCarsBulk } from "@/app/(admin)/admin/carros/actions";
import type { Car } from "@prisma/client";

type CarWithCount = Car & { _count: { leads: number } };

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCars: number;
  perPage: number;
  skip: number;
  consignadoFilter?: string;
  statusFilter?: string;
  fotosFilter?: string;
  buscaFilter?: string;
}

interface Props {
  cars: CarWithCount[];
  pagination: PaginationProps;
}

export default function CarsTableWithBulkDelete({ cars, pagination }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const { page, totalPages, totalCars, perPage, skip, consignadoFilter, statusFilter, fotosFilter, buscaFilter } = pagination;

  const allSelected = cars.length > 0 && cars.every((car) => selectedIds.has(car.id));
  const someSelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cars.map((car) => car.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    const result = await Swal.fire({
      title: "Confirmar Exclusão em Massa",
      html: `Deseja excluir <strong>${count} carro${count > 1 ? "s" : ""}</strong>?<br><small style="color:#6b7280">Esta ação não pode ser desfeita.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Sim, excluir ${count} carro${count > 1 ? "s" : ""}`,
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteCarsBulk(Array.from(selectedIds));
      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Carros excluídos!",
          text: `${res.deleted} carro${res.deleted! > 1 ? "s foram excluídos" : " foi excluído"} com sucesso.`,
          timer: 2000,
          showConfirmButton: false,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        Swal.fire({ icon: "error", title: "Erro", text: res.error || "Erro ao excluir" });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Erro", text: "Erro ao excluir os carros" });
    } finally {
      setIsDeleting(false);
    }
  };

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (consignadoFilter) params.set("consignado", consignadoFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (fotosFilter) params.set("fotos", fotosFilter);
    if (buscaFilter) params.set("busca", buscaFilter);
    return `/admin/carros?${params.toString()}`;
  };

  return (
    <>
      {/* Cars Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {cars.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 flex items-center gap-2 border-b border-gray-200">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-gray-300 text-red-600 cursor-pointer"
              />
              <span className="text-xs text-gray-500">Selecionar todos desta página</span>
            </div>
          )}
          {cars.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              Nenhum carro cadastrado
            </div>
          ) : (
            cars.map((car) => (
              <div
                key={car.id}
                className={`p-4 space-y-3 transition-colors ${selectedIds.has(car.id) ? "bg-red-50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(car.id)}
                    onChange={() => toggleOne(car.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 cursor-pointer flex-shrink-0"
                  />
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
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(car.price)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${car.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {car.status === "AVAILABLE" ? "Disponível" : "Vendido"}
                      </span>
                      {car.consignado && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                          Consignado
                        </span>
                      )}
                      {car.images.length === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold flex items-center gap-0.5">
                          <ImageOff className="w-3 h-3" />
                          Sem Fotos
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
                  <MarkAsSoldButton carId={car.id} carName={`${car.brand} ${car.model}`} currentStatus={car.status} />
                  <DeleteCarButton carId={car.id} carName={`${car.brand} ${car.model}`} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    title="Selecionar todos"
                    className="w-4 h-4 rounded border-gray-300 text-red-600 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Nenhum carro cadastrado
                  </td>
                </tr>
              ) : (
                cars.map((car) => (
                  <tr
                    key={car.id}
                    className={`transition-colors ${selectedIds.has(car.id) ? "bg-red-50 hover:bg-red-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(car.id)}
                        onChange={() => toggleOne(car.id)}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 cursor-pointer"
                      />
                    </td>
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
                      <div className="text-sm font-medium text-gray-900">{car.brand}</div>
                      <div className="text-sm text-gray-500">{car.model}</div>
                      {car.consignado && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                          Consignado
                        </span>
                      )}
                      {car.images.length === 0 && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 mt-1">
                          <ImageOff className="w-3 h-3" />
                          Sem Fotos
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {car.plate !== null ? `${car.plate.slice(0, 3)}-${car.plate.slice(3)}` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(car.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${car.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {car.status === "AVAILABLE" ? "Disponível" : "Vendido"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{car._count.leads}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/catalogo/${car.id}`} target="_blank" className="text-gray-600 hover:text-gray-900" title="Ver no site">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link href={`/admin/carros/${car.id}/editar`} className="text-primary hover:text-primary/80" title="Editar">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <MarkAsSoldButton carId={car.id} carName={`${car.brand} ${car.model}`} currentStatus={car.status} />
                        <DeleteCarButton carId={car.id} carName={`${car.brand} ${car.model}`} />
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
                href={buildPageUrl(Math.max(1, page - 1))}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
              >
                Anterior
              </Link>
              <Link
                href={buildPageUrl(Math.min(totalPages, page + 1))}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
              >
                Próxima
              </Link>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{skip + 1}</span> a{" "}
                <span className="font-medium">{Math.min(skip + perPage, totalCars)}</span> de{" "}
                <span className="font-medium">{totalCars}</span> resultados
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Link
                  href={buildPageUrl(Math.max(1, page - 1))}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
                >
                  Anterior
                </Link>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                    return (
                      <Link
                        key={pageNum}
                        href={buildPageUrl(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === page ? "z-10 bg-primary border-primary text-white" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
                      >
                        {pageNum}
                      </Link>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <Link
                  href={buildPageUrl(Math.min(totalPages, page + 1))}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                  Próxima
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Floating bulk-delete action bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${someSelected ? "translate-y-0" : "translate-y-full"}`}>
        <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedIds.size} carro{selectedIds.size !== 1 ? "s" : ""} selecionado{selectedIds.size !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Cancelar seleção
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Excluindo..." : `Excluir ${selectedIds.size} carro${selectedIds.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </>
  );
}
