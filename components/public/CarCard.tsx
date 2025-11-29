import Link from "next/link";
import Image from "next/image";
import { Car as CarType } from "@prisma/client";
import { Car } from "lucide-react";

interface CarCardProps {
  car: CarType;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <Link
      href={`/catalogo/${car.id}`}
      className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
    >
      <div className="relative h-48 bg-secondary-200">
        {car.images[0] ? (
          <Image
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Car className="h-16 w-16 text-secondary-400" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-secondary-900 mb-2">
          {car.brand} {car.model}
        </h3>
        <p className="text-secondary-600 mb-4">Ano: {car.year}</p>
        <p className="text-2xl font-bold text-accent-500">
          R$ {car.price.toLocaleString("pt-BR")}
        </p>
      </div>
    </Link>
  );
}
