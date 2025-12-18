import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Edit,
  ArrowLeft,
  Calendar,
  DollarSign,
  Gauge,
  Palette,
  Fuel,
  Settings,
  Car,
  MapPin,
  Users,
} from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function CarDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { leads: true },
      },
    },
  });

  if (!car) {
    notFound();
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/carros"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {car.brand} {car.model}
            </h1>
            <p className="text-gray-600 mt-1">{car.version || car.year}</p>
          </div>
        </div>
        <Link
          href={`/admin/carros/${car.id}/editar`}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md font-semibold"
        >
          <Edit className="w-5 h-5" />
          Editar
        </Link>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
            car.status === "AVAILABLE"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {car.status === "AVAILABLE" ? "Disponível" : "Vendido"}
        </span>
        <span className="text-sm text-gray-500">
          Cadastrado em {formatDate(car.createdAt)}
        </span>
      </div>

      {/* Image Gallery */}
      {car.images.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {car.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group"
              >
                <img
                  src={image}
                  alt={`${car.brand} ${car.model} - Imagem ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price and Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Informações Gerais
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">Preço</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(car.price)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Ano Fabricação</p>
                  <p className="font-semibold text-gray-900">{car.year}</p>
                </div>
              </div>

              {car.modelYear && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Ano Modelo</p>
                    <p className="font-semibold text-gray-900">
                      {car.modelYear}
                    </p>
                  </div>
                </div>
              )}

              {car.color && (
                <div className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Cor</p>
                    <p className="font-semibold text-gray-900">{car.color}</p>
                  </div>
                </div>
              )}

              {car.mileage !== null && (
                <div className="flex items-start gap-3">
                  <Gauge className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Quilometragem</p>
                    <p className="font-semibold text-gray-900">
                      {car.mileage.toLocaleString("pt-BR")} km
                    </p>
                  </div>
                </div>
              )}

              {car.fuel && (
                <div className="flex items-start gap-3">
                  <Fuel className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Combustível</p>
                    <p className="font-semibold text-gray-900">{car.fuel}</p>
                  </div>
                </div>
              )}

              {car.transmission && (
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Câmbio</p>
                    <p className="font-semibold text-gray-900">
                      {car.transmission}
                    </p>
                  </div>
                </div>
              )}

              {car.doors && (
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Portas</p>
                    <p className="font-semibold text-gray-900">{car.doors}</p>
                  </div>
                </div>
              )}

              {car.passengers && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Passageiros</p>
                    <p className="font-semibold text-gray-900">
                      {car.passengers}
                    </p>
                  </div>
                </div>
              )}

              {car.plate && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Placa</p>
                    <p className="font-semibold text-gray-900 uppercase">
                      {car.plate}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Descrição
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {car.description}
            </p>
          </div>

          {/* Optionals */}
          {car.optionals && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Opcionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {car.optionals.split(",").map((optional, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">{optional.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {car.additionalInfo && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações Adicionais
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {car.additionalInfo}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estatísticas
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Leads</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {car._count.leads}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Atualizado</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatDate(car.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-3">
              <Link
                href={`/catalogo/${car.id}`}
                target="_blank"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ver no Site
              </Link>
              <Link
                href={`/admin/carros/${car.id}/editar`}
                className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Editar Veículo
              </Link>
            </div>
          </div>

          {/* Vehicle ID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">ID do Veículo</p>
            <p className="text-sm font-mono text-gray-700 break-all">
              {car.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
