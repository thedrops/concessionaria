import { prisma } from "@/lib/prisma";
import { Car as LucidCar, Users, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Car, User } from "@prisma/client/wasm";

export default async function AdminDashboard() {
  // Buscar últimos 6 carros cadastrados
  const recentCars: Car[] = await prisma.car.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Buscar últimos 5 usuários cadastrados
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  // Estatísticas gerais
  const [totalCars, availableCars, totalLeads, totalUsers] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: "AVAILABLE" } }),
    prisma.lead.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-2">
          Visão geral do sistema de concessionária
        </p>
      </div>

      {/* Estatísticas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm font-medium">
                Total de Carros
              </p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">
                {totalCars}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <LucidCar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm font-medium">
                Disponíveis
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {availableCars}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm font-medium">
                Total de Leads
              </p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">
                {totalLeads}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm font-medium">Usuários</p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">
                {totalUsers}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Últimos Carros Cadastrados */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Últimos Carros Cadastrados
            </h2>
            <Link
              href="/admin/carros"
              className="text-primary-500 hover:text-primary-600 text-sm font-medium"
            >
              Ver todos →
            </Link>
          </div>

          {recentCars.length === 0 ? (
            <div className="text-center py-12">
              <LucidCar className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-600">
                Nenhum carro cadastrado ainda
              </p>
              <Link
                href="/admin/carros/novo"
                className="inline-block mt-4 text-primary-500 hover:text-primary-600 font-medium"
              >
                Cadastrar primeiro carro
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCars.map((car: Car) => (
                <Link
                  key={car.id}
                  href={`/admin/carros/${car.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary-50 transition"
                >
                  <div className="relative w-20 h-20 bg-secondary-200 rounded-lg overflow-hidden flex-shrink-0">
                    {car.images[0] ? (
                      <Image
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <LucidCar className="h-8 w-8 text-secondary-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 truncate">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      Ano: {car.year}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-primary-600">
                        R$ {car.price.toLocaleString("pt-BR")}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          car.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {car.status === "AVAILABLE" ? "Disponível" : "Vendido"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-secondary-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(car.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Usuários Cadastrados */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Últimos Usuários Cadastrados
            </h2>
            <Link
              href="/admin/usuarios"
              className="text-primary-500 hover:text-primary-600 text-sm font-medium"
            >
              Ver todos →
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-600">Nenhum usuário cadastrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary-50 transition"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-secondary-900 truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-secondary-600 truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-accent-100 text-accent-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "ADMIN" ? "Administrador" : "Operador"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-secondary-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Link Rápido para Ações */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/carros/novo"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <LucidCar className="h-8 w-8" />
            <span className="font-medium">Cadastrar Carro</span>
          </Link>
          <Link
            href="/admin/leads"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <Users className="h-8 w-8" />
            <span className="font-medium">Ver Leads</span>
          </Link>
          <a
            href="/api/export/cars"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition flex items-center gap-3"
          >
            <DollarSign className="h-8 w-8" />
            <span className="font-medium">Exportar Carros</span>
          </a>
        </div>
      </div>
    </div>
  );
}
