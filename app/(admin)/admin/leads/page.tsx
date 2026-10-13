import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Mail, Phone, Calendar, Car } from "lucide-react";
import DeleteLeadButton from "@/components/admin/DeleteLeadButton";

interface PageProps {
  searchParams: { page?: string };
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  const [leads, totalLeads] = await Promise.all([
    prisma.lead.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        car: {
          select: {
            brand: true,
            model: true,
            year: true,
          },
        },
      },
    }),
    prisma.lead.count(),
  ]);

  const totalPages = Math.ceil(totalLeads / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">
            Leads
          </h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">
            Gerencie os contatos interessados
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Total de Leads
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">
            {totalLeads}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Hoje
          </h3>
          <p className="text-3xl font-bold text-primary dark:text-blue-400 mt-2">
            {
              leads.filter(
                (l) =>
                  new Date(l.createdAt).toDateString() ===
                  new Date().toDateString(),
              ).length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Esta Semana
          </h3>
          <p className="text-3xl font-bold text-secondary dark:text-slate-100 mt-2">
            {
              leads.filter((l) => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(l.createdAt) >= oneWeekAgo;
              }).length
            }
          </p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
          {leads.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-slate-300">
              Nenhum lead cadastrado
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    {lead.name}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-slate-400 flex-shrink-0">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-slate-400 flex-shrink-0" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="truncate hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-slate-400 flex-shrink-0" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                  <Car className="w-4 h-4 text-gray-400 dark:text-slate-400 flex-shrink-0" />
                  <span>
                    {lead.car.brand} {lead.car.model} ({lead.car.year})
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300 font-medium min-h-[44px] px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 transition"
                  >
                    WhatsApp
                  </a>
                  <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Veículo de Interesse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-slate-300"
                  >
                    Nenhum lead cadastrado
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {lead.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-gray-900 dark:text-slate-100">
                          <Mail className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-400" />
                          {lead.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-900 dark:text-slate-100">
                          <Phone className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-400" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Car className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {lead.car.brand} {lead.car.model}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-300">
                            {lead.car.year}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-slate-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                        >
                          WhatsApp
                        </a>
                        <DeleteLeadButton
                          leadId={lead.id}
                          leadName={lead.name}
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
          <div className="bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Link
                href={`/admin/leads?page=${Math.max(1, page - 1)}`}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                  page === 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Anterior
              </Link>
              <Link
                href={`/admin/leads?page=${Math.min(totalPages, page + 1)}`}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Próxima
              </Link>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-slate-200">
                  Mostrando <span className="font-medium">{skip + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(skip + perPage, totalLeads)}
                  </span>{" "}
                  de <span className="font-medium">{totalLeads}</span>{" "}
                  resultados
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Link
                    href={`/admin/leads?page=${Math.max(1, page - 1)}`}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 ${
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
                          href={`/admin/leads?page=${pageNum}`}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === page
                              ? "z-10 bg-primary border-primary text-white"
                              : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <span
                          key={pageNum}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-gray-700 dark:text-slate-200"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <Link
                    href={`/admin/leads?page=${Math.min(totalPages, page + 1)}`}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 ${
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
