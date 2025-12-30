import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Car as LucidCar, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Car, Post } from "@prisma/client/wasm";
import { getImageUrl } from "@/lib/image-url";

async function getLatestCars() {
  return await prisma.car.findMany({
    where: { status: "AVAILABLE" },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

async function getLatestPosts() {
  return await prisma.post.findMany({
    where: { published: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });
}

export default async function Home() {
  const latestCars = await getLatestCars();
  const latestPosts = await getLatestPosts();

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Encontre o Carro dos Seus Sonhos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              A melhor seleção de veículos com qualidade garantida
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Ver Catálogo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Cars */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Destaques do Estoque
            </h2>
            <p className="text-secondary-600">
              Confira nossos carros mais recentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestCars.map((car: Car) => (
              <Link
                key={car.id}
                href={`/catalogo/${car.id}`}
                className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative h-48 bg-secondary-200">
                  {car.images[0] ? (
                    <Image
                      src={getImageUrl(car.images[0])}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <LucidCar className="h-16 w-16 text-secondary-400" />
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
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/catalogo"
              className="inline-flex items-center text-primary-500 hover:text-primary-600 font-semibold"
            >
              Ver todos os carros
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section className="py-16 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                Últimas Notícias
              </h2>
              <p className="text-secondary-600">
                Fique por dentro das novidades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post: Post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  {post.image && (
                    <div className="relative h-48">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-secondary-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-secondary-600 mb-4">{post.excerpt}</p>
                    <div className="text-sm text-secondary-500">
                      {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
