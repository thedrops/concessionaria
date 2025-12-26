import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Gauge, Tag, Car as CarIcon } from "lucide-react";
import InterestModal from "@/components/public/InterestModal";
import ImageGallery from "@/components/public/ImageGallery";
import { Car } from "@prisma/client/wasm";

interface CarDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function CarDetailsPage({ params }: CarDetailsPageProps) {
  const car = await prisma.car.findUnique({
    where: { id: params.id },
  });

  if (!car || car.status !== "AVAILABLE") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Image Gallery */}
          <div className="p-6">
            <ImageGallery
              images={car.images.length > 0 ? car.images : []}
              alt={`${car.brand} ${car.model}`}
            />
          </div>

          {/* Car Details */}
          <div className="p-6 border-t border-secondary-200">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-secondary-900 mb-2">
                {car.brand} {car.model}
              </h1>
              <p className="text-3xl font-bold text-accent-500">
                R$ {car.price.toLocaleString("pt-BR")}
              </p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                <Calendar className="h-8 w-8 text-primary-500" />
                <div>
                  <p className="text-sm text-secondary-600">Ano Fabricação</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {car.year}
                  </p>
                </div>
              </div>

              {car.modelYear && (
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="text-sm text-secondary-600">Ano Modelo</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {car.modelYear}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                <Tag className="h-8 w-8 text-primary-500" />
                <div>
                  <p className="text-sm text-secondary-600">Marca</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {car.brand}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                <Gauge className="h-8 w-8 text-primary-500" />
                <div>
                  <p className="text-sm text-secondary-600">Modelo</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {car.model}
                  </p>
                </div>
              </div>

              {car.version && (
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <Tag className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="text-sm text-secondary-600">Versão</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {car.version}
                    </p>
                  </div>
                </div>
              )}

              {car.transmission && (
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <CarIcon className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="text-sm text-secondary-600">Câmbio</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {car.transmission}
                    </p>
                  </div>
                </div>
              )}

              {car.doors && (
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <CarIcon className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="text-sm text-secondary-600">Portas</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {car.doors}
                    </p>
                  </div>
                </div>
              )}

              {car.fuel && (
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <Gauge className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="text-sm text-secondary-600">Combustível</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {car.fuel}
                    </p>
                  </div>
                </div>
              )}

              {car.mileage !== null && (
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <Gauge className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="text-sm text-secondary-600">Km</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {car.mileage.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              )}

              {car.passengers && (
                <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                  <CarIcon className="h-8 w-8 text-primary-500" />
                  <div>
                    <p className="text-sm text-secondary-600">Passageiros</p>
                    <p className="text-lg font-semibold text-secondary-900">
                      {car.passengers}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Descrição
              </h2>
              <p className="text-secondary-700 whitespace-pre-line">
                {car.description}
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <InterestModal car={car} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
