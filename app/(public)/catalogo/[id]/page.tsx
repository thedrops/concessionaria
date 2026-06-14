import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Calendar,
  Car as CarIcon,
  CheckCircle,
  Clock,
  DoorOpen,
  Fuel,
  Gauge,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import InterestModal from "@/components/public/InterestModal";
import ImageGallery from "@/components/public/ImageGallery";
import CarCard from "@/components/public/CarCard";

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

  const relatedCars = await prisma.car.findMany({
    where: {
      status: "AVAILABLE",
      id: { not: car.id },
      OR: car.fuel
        ? [{ brand: car.brand }, { fuel: car.fuel }]
        : [{ brand: car.brand }],
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const features = car.optionals
    ? car.optionals
        .split(/\r?\n|,|;/)
        .map((feature) => feature.trim())
        .filter(Boolean)
    : [];

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no veículo ${car.brand} ${car.model} (${car.year}).`,
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6 text-sm text-secondary-500">
          <Link href="/catalogo" className="hover:text-primary">
            Catálogo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-secondary-900">
            {car.brand} {car.model}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
          <ImageGallery
            images={car.images.length > 0 ? car.images : []}
            alt={`${car.brand} ${car.model}`}
          />

          <aside className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 mb-3">
                {car.brand} {car.model}
              </h1>
              <p className="text-lg text-secondary-500">
                Ano {car.year}
                {car.modelYear ? ` / Modelo ${car.modelYear}` : ""}
              </p>
            </div>

            <div className="rounded-lg bg-secondary-50 p-6 border border-secondary-100">
              <p className="text-sm font-medium text-secondary-500 mb-1">
                Preço
              </p>
              <p className="text-4xl font-bold text-blue-500 mb-5">
                R$ {car.price.toLocaleString("pt-BR")}
              </p>
              <div className="space-y-3">
                <InterestModal car={car} />
                <a
                  href={`https://wa.me/5512974088993?text=${whatsappMessage}`}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition hover:bg-blue-50"
                >
                  Fale via WhatsApp
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="badge-featured">
                <Star className="h-3.5 w-3.5" />
                Destaque
              </span>
              <span className="badge-available">
                <CheckCircle className="h-3.5 w-3.5" />
                Disponível
              </span>
            </div>
          </aside>
        </div>

        <section className="py-12">
          <h2 className="text-3xl font-display font-bold text-secondary-900 mb-6">
            Especificações
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Combustível",
                value: car.fuel || "Consulte",
                icon: Fuel,
              },
              {
                label: "Câmbio",
                value: car.transmission || "Consulte",
                icon: CarIcon,
              },
              {
                label: "Passageiros",
                value: car.passengers ? String(car.passengers) : "Consulte",
                icon: Users,
              },
              {
                label: "Portas",
                value: car.doors ? String(car.doors) : "Consulte",
                icon: DoorOpen,
              },
              { label: "Ano", value: car.year, icon: Calendar },
              {
                label: "Quilometragem",
                value:
                  car.mileage !== null
                    ? `${car.mileage.toLocaleString("pt-BR")} km`
                    : "Consulte",
                icon: Gauge,
              },
              { label: "Cor", value: car.color || "Consulte", icon: CarIcon },
              { label: "Versão", value: car.version || "Consulte", icon: Star },
            ].map((spec) => (
              <div
                key={spec.label}
                className="rounded-lg bg-secondary-50 p-5 border border-secondary-100"
              >
                <spec.icon className="h-6 w-6 text-primary mb-3" />
                <p className="text-sm text-secondary-500">{spec.label}</p>
                <p className="font-semibold text-secondary-900">{spec.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2 pb-12">
          <div>
            <h2 className="text-3xl font-display font-bold text-secondary-900 mb-4">
              Descrição
            </h2>
            <p className="text-secondary-600 leading-relaxed whitespace-pre-line">
              {car.description}
            </p>
            {car.additionalInfo && (
              <p className="mt-4 text-secondary-600 leading-relaxed whitespace-pre-line">
                {car.additionalInfo}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-secondary-900 mb-4">
              Características
            </h2>
            {features.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-secondary-700"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary-600">
                Consulte nossa equipe para confirmar opcionais e detalhes deste
                veículo.
              </p>
            )}
          </div>
        </section>

        {relatedCars.length > 0 && (
          <section className="py-12">
            <h2 className="text-3xl font-display font-bold text-secondary-900 mb-6">
              Veículos Relacionados
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedCars.map((relatedCar) => (
                <CarCard key={relatedCar.id} car={relatedCar} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
