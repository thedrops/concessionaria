import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Car as LucidCar,
  ArrowRight,
  Shield,
  Award,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Quote,
  Search,
  FileText,
  Key,
} from "lucide-react";
import Image from "next/image";
import { Post, Prisma } from "@prisma/client/wasm";
import { getImageUrl } from "@/lib/image-url";
import Carousel from "@/components/public/Carousel";

// Revalidar a página a cada 60 segundos
export const revalidate = 60;

type CarWithImages = Prisma.CarGetPayload<{
  include: { carImages: true };
}>;

async function getLatestCars() {
  try {
    return await prisma.car.findMany({
      where: { status: "AVAILABLE", NOT: { images: { isEmpty: true } } },
      take: 6,
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

async function getLatestPosts() {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });
  } catch {
    return [];
  }
}

async function getCarouselImages() {
  try {
    return await prisma.carouselImage.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        image: true,
        title: true,
        link: true,
      },
    });
  } catch {
    return [];
  }
}

const testimonials = [
  {
    name: "Maria Silva",
    car: "Honda Civic 2020",
    text: "Atendimento excepcional! Comprei meu carro com total segurança e transparência. Equipe super atenciosa e o carro veio exatamente como anunciado.",
    rating: 5,
  },
  {
    name: "João Santos",
    car: "Toyota Corolla 2019",
    text: "Melhor experiência de compra que já tive. Processo rápido, sem burocracia, e com financiamento aprovado em poucos dias. Super recomendo!",
    rating: 5,
  },
  {
    name: "Ana Costa",
    car: "Jeep Compass 2021",
    text: "Comprei meu Compass aqui e não poderia estar mais feliz. Carro impecável, documentação toda em ordem e pós-venda excelente.",
    rating: 5,
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Garantia de Qualidade",
    description:
      "Todos os nossos veículos passam por rigorosa inspeção técnica de 150 pontos antes de serem disponibilizados.",
  },
  {
    icon: Award,
    title: "15 Anos de Experiência",
    description:
      "Mais de uma década atuando no mercado automotivo com milhares de clientes satisfeitos em todo o país.",
  },
  {
    icon: TrendingUp,
    title: "Melhor Custo-Benefício",
    description:
      "Preços justos e competitivos com as melhores condições de financiamento do mercado.",
  },
  {
    icon: Users,
    title: "Atendimento Personalizado",
    description:
      "Equipe especializada pronta para encontrar o veículo perfeito para suas necessidades e orçamento.",
  },
];

const processSteps = [
  {
    icon: Search,
    title: "Escolha seu Veículo",
    description: "Navegue por nosso catálogo completo e encontre o carro ideal",
  },
  {
    icon: FileText,
    title: "Análise de Crédito",
    description: "Aprovação de financiamento rápida e sem complicação",
  },
  {
    icon: CheckCircle2,
    title: "Vistoria Completa",
    description: "Realize test drive e vistoria técnica detalhada",
  },
  {
    icon: Key,
    title: "Retire seu Carro",
    description: "Documentação pronta e entrega imediata",
  },
];

export default async function Home() {
  const latestCars = await getLatestCars();
  const latestPosts = await getLatestPosts();
  const carouselImages = await getCarouselImages();

  return (
    <div className="overflow-hidden">
      {/* Carousel */}
      {carouselImages.length > 0 && <Carousel images={carouselImages} />}

      {/* Hero Section - Redesigned */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300 rounded-full filter blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
                Seu Carro dos
                <span className="block text-accent-400">Sonhos Está Aqui</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 leading-relaxed">
                Veículos seminovos e usados de qualidade com{" "}
                <strong>garantia real</strong>,
                <strong> financiamento facilitado</strong> e mais de{" "}
                <strong>15 anos de confiança</strong> no mercado automotivo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/catalogo"
                  className="group inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 hover:shadow-2xl"
                >
                  Ver Catálogo Completo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#processo"
                  className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-lg transition-all border border-white/20"
                >
                  Como Funciona
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-accent-400">
                    15+
                  </div>
                  <div className="text-sm text-primary-200">
                    Anos no Mercado
                  </div>
                </div>
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-accent-400">
                    5000+
                  </div>
                  <div className="text-sm text-primary-200">
                    Carros Vendidos
                  </div>
                </div>
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: "0.6s" }}
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-accent-400">
                    4.9★
                  </div>
                  <div className="text-sm text-primary-200">
                    Avaliação Média
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div
              className="relative animate-fade-in-scale hidden md:block"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="relative z-10">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent-500/20 to-primary-300/20 backdrop-blur-sm border border-white/10 p-8 flex items-center justify-center">
                  <LucidCar
                    className="w-full h-full text-white/80"
                    strokeWidth={0.5}
                  />
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-500 rounded-full opacity-20 animate-float"></div>
              <div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-300 rounded-full opacity-20 animate-float"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - E-E-A-T */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 mb-4">
              Por Que Escolher a Israel Veículos?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Experiência comprovada, qualidade garantida e atendimento que faz
              a diferença na hora de realizar seu sonho.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up border border-secondary-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Cars - Redesigned */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="mb-6 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 mb-3">
                Veículos em Destaque
              </h2>
              <p className="text-xl text-secondary-600">
                Confira os carros mais recentes do nosso estoque selecionado
              </p>
            </div>
            <Link
              href="/catalogo"
              className="group inline-flex items-center text-primary-500 hover:text-primary-600 font-bold text-lg transition-colors"
            >
              Ver Todos
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestCars.map((car: CarWithImages, index) => (
              <Link
                key={car.id}
                href={`/catalogo/${car.id}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-56 bg-secondary-200 overflow-hidden">
                  {car.carImages && car.carImages[0] ? (
                    <Image
                      src={getImageUrl(car.carImages[0].url)}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : car.images[0] ? (
                    <Image
                      src={getImageUrl(car.images[0])}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <LucidCar className="h-20 w-20 text-secondary-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Disponível
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-secondary-600 mb-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Ano: {car.year}
                  </p>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-sm text-secondary-500 mb-1">
                        A partir de
                      </div>
                      <p className="text-3xl font-display font-bold text-accent-500">
                        R$ {car.price.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-primary-500 group-hover:text-primary-600 transition-colors">
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-accent-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-300 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Compre com Total Segurança e Confiança
              </h2>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Na Israel Veículos, cada carro passa por uma{" "}
                <strong>inspeção técnica rigorosa de 150 pontos</strong>
                antes de ser disponibilizado. Oferecemos garantia, documentação
                completa e transparência total em cada negociação.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-accent-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Inspeção de 150 Pontos
                    </h4>
                    <p className="text-primary-200">
                      Verificação mecânica, elétrica e de segurança completa
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-accent-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">Garantia Real</h4>
                    <p className="text-primary-200">
                      Cobertura para motor e câmbio em todos os veículos
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-accent-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Documentação Revisada
                    </h4>
                    <p className="text-primary-200">
                      Sem pendências, multas ou restrições
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-accent-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Financiamento Facilitado
                    </h4>
                    <p className="text-primary-200">
                      Parcerias com os principais bancos do país
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <Shield className="w-20 h-20 text-accent-400 mb-6" />
                <h3 className="text-2xl font-display font-bold mb-4">
                  Nossa Garantia para Você
                </h3>
                <ul className="space-y-3 text-primary-100">
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-accent-400 mr-3" />
                    Veículos com histórico verificado
                  </li>
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-accent-400 mr-3" />
                    Test drive sem compromisso
                  </li>
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-accent-400 mr-3" />
                    Suporte pós-venda dedicado
                  </li>
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-accent-400 mr-3" />
                    Troca facilitada em até 7 dias
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="processo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 mb-4">
              Como Funciona o Processo de Compra
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              4 passos simples para você sair dirigindo o carro dos seus sonhos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-accent-500 to-accent-300 z-0"></div>
                )}

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full mb-6 shadow-lg transform hover:scale-110 transition-transform">
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-secondary-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/catalogo"
              className="inline-flex items-center bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 mb-4">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-secondary-600">
              Depoimentos reais de quem já realizou o sonho com a Israel
              Veículos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <Quote className="w-10 h-10 text-accent-500 mb-4" />
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-secondary-700 mb-6 italic leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="border-t border-secondary-200 pt-4">
                  <p className="font-bold text-secondary-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {testimonial.car}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 mb-4">
                Últimas Notícias e Dicas
              </h2>
              <p className="text-xl text-secondary-600">
                Fique por dentro das novidades do mundo automotivo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post: Post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-secondary-100 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {post.image && (
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-display font-bold text-secondary-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-secondary-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-secondary-500">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-primary-500 font-semibold hover:text-primary-600">
                        Ler mais →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-mesh"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Pronto para Encontrar seu Próximo Carro?
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 mb-10 leading-relaxed">
            Navegue por nosso catálogo completo e descubra ofertas exclusivas.
            Nossa equipe está pronta para te ajudar a realizar esse sonho!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-lg transition-all transform hover:scale-105 shadow-2xl"
            >
              Ver Catálogo Completo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/sobre"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-lg transition-all border border-white/20"
            >
              Conhecer a Empresa
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
