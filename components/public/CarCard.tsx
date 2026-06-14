import Link from "next/link";
import Image from "next/image";
import { Car as CarType } from "@prisma/client";
import { Car, CheckCircle, Heart, ShieldCheck, Star } from "lucide-react";
import { getImageUrl } from "@/lib/image-url";

interface CarCardProps {
  car: CarType;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <Link
      href={`/catalogo/${car.id}`}
      className="group block bg-white rounded-lg border border-secondary-100 shadow-sm overflow-hidden card-hover"
    >
      <div className="relative h-52 bg-secondary-200 overflow-hidden">
        {car.images[0] ? (
          <Image
            src={getImageUrl(car.images[0])}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Car className="h-16 w-16 text-secondary-400" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="badge-featured bg-blue-100/95">
            <Star className="h-3.5 w-3.5" />
            Destaque
          </span>
          <span className="badge-available bg-cyan-50/95">
            <CheckCircle className="h-3.5 w-3.5" />
            Disponível
          </span>
        </div>
        <span
          aria-label="Favorito"
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-secondary-700 shadow-sm transition group-hover:text-accent-500"
        >
          <Heart className="h-5 w-5" />
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary transition-colors">
          {car.brand} {car.model}
        </h3>
        <p className="text-secondary-500 mb-4">Ano: {car.year}</p>
        <p className="text-2xl font-bold text-blue-500 mb-5">
          R$ {car.price.toLocaleString("pt-BR")}
        </p>
        <span className="inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white transition-colors group-hover:bg-blue-600">
          Ver Detalhes
        </span>
      </div>
    </Link>
  );
}
