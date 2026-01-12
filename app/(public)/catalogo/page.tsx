import CatalogFilters from "@/components/public/CatalogFilters";
import CatalogGrid from "@/components/public/CatalogGrid";
import CatalogSearchBar from "@/components/public/CatalogSearchBar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-secondary-900 mb-8">
          Catálogo de Veículos
        </h1>

        <Suspense fallback={null}>
          <CatalogSearchBar />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
