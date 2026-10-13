import CatalogFilters from "@/components/public/CatalogFilters";
import CatalogGrid from "@/components/public/CatalogGrid";
import CatalogSearchBar from "@/components/public/CatalogSearchBar";
import { Suspense } from "react";
import { Filter, Loader2 } from "lucide-react";

// Revalidar a página a cada 60 segundos
export const revalidate = 60;

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <section className="bg-secondary-50 dark:bg-slate-800 border-b border-secondary-100 dark:border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 dark:text-slate-100 mb-3">
            Catálogo de Veículos
          </h1>
          <p className="text-lg text-secondary-500 dark:text-slate-300">
            Encontre seminovos e usados selecionados pela Israel Veículos.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-secondary-100 dark:border-slate-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={null}>
            <CatalogSearchBar />
          </Suspense>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <details className="lg:hidden mb-6 rounded-lg border border-secondary-200 dark:border-slate-700 bg-secondary-50 dark:bg-slate-800 p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-secondary-900 dark:text-slate-100">
            <Filter className="h-5 w-5 text-primary dark:text-blue-400" />
            Filtros
          </summary>
          <div className="mt-4">
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
                </div>
              }
            >
              <CatalogFilters />
            </Suspense>
          </div>
        </details>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
                </div>
              }
            >
              <CatalogFilters />
            </Suspense>
          </aside>

          <div className="lg:col-span-3">
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
                </div>
              }
            >
              <CatalogGrid />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
