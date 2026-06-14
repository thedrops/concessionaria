import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Key,
  Search,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { Prisma } from "@prisma/client";
import CarCard from "@/components/public/CarCard";
import { getImageUrl } from "@/lib/image-url";

export const revalidate = 60;

type CarWithImages = Prisma.CarGetPayload<{
  include: { carImages: true };
}>;

async function getLatestCars() {
  try {
    return await prisma.car.findMany({
      where: { status: "AVAILABLE" },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        carImages: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    });
  } catch {
    return [];
  }
}

async function getHeroImage() {
  try {
    const image = await prisma.carouselImage.findFirst({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { image: true },
    });

    return image?.image || null;
  } catch {
    return null;
  }
}

const benefits = [
  {
    icon: Shield,
    title: "Garantia",
    description:
      "Veículos selecionados e revisados para uma compra mais tranquila.",
  },
  {
    icon: Zap,
    title: "Financiamento",
    description:
      "Condições facilitadas com atendimento próximo do início ao fim.",
  },
  {
    icon: Users,
    title: "Atendimento",
    description:
      "Equipe preparada para entender seu perfil e indicar boas opções.",
  },
  {
    icon: CheckCircle,
    title: "Experiência",
    description: "Tradição no mercado automotivo e foco em transparência.",
  },
];

const processSteps = [
  {
    icon: Search,
    title: "Escolha",
    description:
      "Consulte o catálogo e selecione os veículos do seu interesse.",
  },
  {
    icon: FileText,
    title: "Simule",
    description: "Receba apoio para financiamento, documentação e negociação.",
  },
  {
    icon: CheckCircle,
    title: "Confira",
    description:
      "Veja os detalhes, faça sua avaliação e tire todas as dúvidas.",
  },
  {
    icon: Key,
    title: "Retire",
    description: "Finalize a compra e saia com seu veículo pronto para rodar.",
  },
];

export default async function Home() {
  const latestCars = await getLatestCars();
  const heroImage = await getHeroImage();

  return (
    <div className="bg-white">
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden text-white">
        {heroImage ? (
          <Image
            src={getImageUrl(heroImage)}
            alt="Israel Veículos"
            fill
            priority
            className="object-cover"
          />
        ) : (
          <Image
            src="/logo.jpg"
            alt="Israel Veículos"
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-800/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
              Encontre o Carro Perfeito
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 leading-relaxed mb-8">
              Seminovos e usados selecionados, atendimento transparente e boas
              condições para você comprar com confiança.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-4 font-semibold text-primary transition hover:bg-blue-50"
              >
                Ver Catálogo Completo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="tel:+5512974088993"
                className="inline-flex items-center justify-center rounded-lg border border-white px-7 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Fale Conosco
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-secondary-100 bg-white py-5">
        <form
          action="/catalogo"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              name="search"
              type="text"
              placeholder="Buscar por marca, modelo, placa..."
              className="min-h-12 flex-1 rounded-lg border border-secondary-200 px-4 text-secondary-900 outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="btn-primary min-h-12">
              Buscar
            </button>
          </div>
        </form>
      </section>

      <section className="bg-secondary-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-secondary-900 mb-3">
              Por Que Escolher a Israel Veículos?
            </h2>
            <p className="text-lg text-secondary-500">
              Qualidade, atendimento e experiência em cada negociação.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="card-hover rounded-lg bg-white p-6 shadow-sm border border-secondary-100"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-secondary-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl font-display font-bold text-secondary-900 mb-3">
                Veículos em Destaque
              </h2>
              <p className="text-lg text-secondary-500">
                Confira alguns modelos disponíveis no estoque.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center font-semibold text-primary hover:text-primary-700"
            >
              Ver Todos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestCars.map((car: CarWithImages) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-secondary-900 mb-3">
              Processo de Compra
            </h2>
            <p className="text-lg text-secondary-500">
              Quatro etapas simples para comprar com segurança.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute left-1/2 top-8 h-0.5 w-full bg-secondary-200" />
                )}
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-800 text-white text-2xl font-bold">
                  {index + 1}
                </div>
                <step.icon className="mx-auto mb-3 h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-secondary-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Pronto para encontrar seu próximo veículo?
          </h2>
          <p className="text-lg text-blue-50 mb-8">
            Veja o catálogo completo ou fale com nossa equipe pelo WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-4 font-semibold text-primary hover:bg-blue-50"
            >
              Ver Catálogo
            </Link>
            <a
              href="https://wa.me/5512974088993"
              className="inline-flex items-center justify-center rounded-lg border border-white px-7 py-4 font-semibold text-white hover:bg-white/10"
            >
              Contato via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
