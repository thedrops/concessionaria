import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Gauge, Tag, Car as CarIcon } from "lucide-react";
import InterestModal from "@/components/public/InterestModal";
import { Car } from "@prisma/client/wasm";

interface CarDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function CarDetailsPage({ params }: CarDetailsPageProps) {
  const car: Car = await prisma.car.findUnique({
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {car.images.length > 0 ? (
              <>
                <div className="relative h-96 bg-secondary-200 rounded-lg overflow-hidden">
                  <Image
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                {car.images.length > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {car.images.slice(1, 5).map((image, index) => (
                      <div
                        key={index}
                        className="relative h-44 bg-secondary-200 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={image}
                          alt={`${car.brand} ${car.model} - ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-96 bg-secondary-200 rounded-lg">
                <CarIcon className="h-32 w-32 text-secondary-400" />
              </div>
            )}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                <Calendar className="h-8 w-8 text-primary-500" />
                <div>
                  <p className="text-sm text-secondary-600">Ano</p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {car.year}
                  </p>
                </div>
              </div>

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
