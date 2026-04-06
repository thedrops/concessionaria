import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Award, Users, TrendingUp, Shield } from "lucide-react";

export const metadata: Metadata = {
  title:
    "Sobre a Israel Veículos - Mais de 42 Anos de Tradição no Litoral Norte",
  description:
    "Conheça a história da Israel Veículos, concessionária com mais de 42 anos de tradição no mesmo local, referência em vendas de veículos seminovos no Litoral Norte de São Paulo. Qualidade, confiança e experiência comprovada.",
  keywords: [
    "Israel Veículos",
    "concessionária litoral norte",
    "veículos seminovos são sebastião",
    "carros usados litoral norte",
    "42 anos tradição",
    "concessionária são paulo",
    "história israel veículos",
  ],
  openGraph: {
    title: "Sobre a Israel Veículos - 42 Anos de Tradição",
    description:
      "Desde 1984 no mesmo local, atendendo todo o Litoral Norte com qualidade e confiança.",
    type: "website",
  },
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section com Tipografia Impactante */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.2),transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-accent-500/20 backdrop-blur-sm border border-accent-400/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Award className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-medium text-accent-200">
                Fundada em 1984
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
              <span className="block text-primary-100 animate-slide-up">
                Mais de
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 animate-slide-up animation-delay-100">
                42 Anos
              </span>
              <span className="block text-primary-50 animate-slide-up animation-delay-200">
                de Tradição
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-primary-100 leading-relaxed mb-8 animate-fade-in animation-delay-300">
              No mesmo endereço, servindo gerações de famílias do Litoral Norte
              de São Paulo com excelência, confiança e compromisso.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Nossa História */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-primary-900 leading-tight">
                Uma História de{" "}
                <span className="text-accent-600">Credibilidade</span> e
                Crescimento
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full" />
              <p className="text-lg text-gray-700 leading-relaxed">
                A Israel Veículos nasceu em 1984 com uma missão clara: oferecer
                veículos de qualidade com atendimento excepcional. Ao longo de
                mais de quatro décadas, permanecemos firmes no mesmo local,
                construindo relacionamentos duradouros e uma reputação sólida no
                mercado automobilístico do Litoral Norte.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Nossa permanência no mesmo endereço por mais de 42 anos não é
                apenas uma curiosidade - é um testemunho de nossa estabilidade,
                compromisso com a comunidade e dedicação em servir nossos
                clientes com excelência. Enquanto muitas empresas vêm e vão, nós
                continuamos aqui, honrando a confiança que milhares de famílias
                depositaram em nós ao longo dos anos.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/20 to-primary-500/20 blur-2xl rounded-3xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full mb-3">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black text-primary-900 mb-1">
                      42+
                    </div>
                    <div className="text-sm font-semibold text-primary-700">
                      Anos de Mercado
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-accent-50 to-accent-100/50 rounded-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-600 text-white rounded-full mb-3">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black text-accent-900 mb-1">
                      1
                    </div>
                    <div className="text-sm font-semibold text-accent-700">
                      Mesmo Endereço
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-accent-50 to-accent-100/50 rounded-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-600 text-white rounded-full mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black text-accent-900 mb-1">
                      1000+
                    </div>
                    <div className="text-sm font-semibold text-accent-700">
                      Clientes Atendidos
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full mb-3">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black text-primary-900 mb-1">
                      100%
                    </div>
                    <div className="text-sm font-semibold text-primary-700">
                      Compromisso
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Atuação */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.5)_50%,transparent_75%)] bg-[length:200px_200px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Atendimento que Supera Fronteiras
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full mx-auto mb-6" />
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Embora estejamos localizados no coração do Litoral Norte, nossa
              reputação e serviços alcançam clientes de diversas regiões.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-accent-400/50 transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 backdrop-blur-sm border border-accent-400/30 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-accent-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Litoral Norte</h3>
              <p className="text-primary-100 leading-relaxed">
                Nossa região de origem e principal área de atuação. Atendemos
                São Sebastião, Caraguatatuba, Ubatuba, Ilhabela e toda a costa
                norte paulista com excelência e proximidade.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-accent-400/50 transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 backdrop-blur-sm border border-accent-400/30 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-accent-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Vale do Paraíba</h3>
              <p className="text-primary-100 leading-relaxed">
                Expandimos nosso atendimento para cidades do Vale do Paraíba,
                levando nossa tradição de qualidade e confiança para uma região
                cada vez mais conectada ao Litoral Norte.
              </p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-accent-400/50 transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-500/20 backdrop-blur-sm border border-accent-400/30 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-accent-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Outras Localidades</h3>
              <p className="text-primary-100 leading-relaxed">
                Nossa reputação nos precede. Recebemos clientes de diversas
                regiões de São Paulo e estados vizinhos, todos em busca da
                qualidade e segurança que só a experiência de décadas
                proporciona.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6">
              Valores que Nos Definem
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full mx-auto mb-6" />
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Nossa longevidade não é acidente. É resultado de princípios
              sólidos que guiam cada decisão e cada relacionamento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Transparência",
                description:
                  "Acreditamos em negócios claros e honestos. Cada veículo é apresentado com total transparência sobre sua condição, histórico e documentação.",
              },
              {
                title: "Qualidade",
                description:
                  "Selecionamos criteriosamente cada veículo em nosso estoque. Nosso compromisso é oferecer apenas automóveis que passam por rigorosa avaliação técnica.",
              },
              {
                title: "Experiência",
                description:
                  "Mais de quatro décadas de mercado nos deram expertise incomparável. Conhecemos profundamente o mercado automotivo e as necessidades de nossos clientes.",
              },
              {
                title: "Confiança",
                description:
                  "Construída ao longo de gerações, nossa relação com clientes é baseada em confiança mútua, atendimento personalizado e pós-venda atencioso.",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-accent-500 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 to-accent-600 rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <h3 className="text-2xl font-bold text-primary-900 mb-4 group-hover:text-accent-600 transition-colors">
                  {value.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por Que Nos Escolher */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6 leading-tight">
                Por Que Escolher a{" "}
                <span className="text-accent-600">Israel Veículos</span>?
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full mb-8" />

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-900 mb-2">
                      Estabilidade Comprovada
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Mais de 42 anos no mesmo endereço é prova de solidez,
                      comprometimento e respeito com nossos clientes. Você sabe
                      onde nos encontrar hoje, amanhã e sempre.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-900 mb-2">
                      Conhecimento do Mercado Local
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Ninguém conhece as necessidades do Litoral Norte como nós.
                      Entendemos as particularidades da região, desde veículos
                      ideais para terrenos litorâneos até documentação
                      específica.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-900 mb-2">
                      Atendimento Geracional
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Temos orgulho de atender filhos e netos de nossos
                      primeiros clientes. Essa continuidade demonstra a
                      confiança construída ao longo das décadas e a satisfação
                      transmitida entre gerações.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-900 mb-2">
                      Variedade e Qualidade
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Mantemos um estoque diversificado de veículos
                      cuidadosamente selecionados. Cada automóvel passa por
                      criteriosa avaliação para garantir que você adquira um
                      veículo confiável.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/20 to-primary-500/20 blur-3xl rounded-3xl" />
              <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 rounded-3xl p-12 shadow-2xl text-white">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-600/20 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-accent-500/20 backdrop-blur-sm border border-accent-400/30 rounded-full px-4 py-2 mb-6">
                    <Shield className="w-4 h-4 text-accent-400" />
                    <span className="text-sm font-medium text-accent-200">
                      Tradição e Confiança
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold mb-6">
                    Crescendo Junto com o Litoral Norte
                  </h3>

                  <p className="text-primary-100 leading-relaxed mb-8">
                    Nossa história se entrelaça com o desenvolvimento do Litoral
                    Norte de São Paulo. Acompanhamos o crescimento da região,
                    sempre mantendo nosso compromisso com qualidade e
                    atendimento excepcional.
                  </p>

                  <p className="text-primary-100 leading-relaxed mb-8">
                    Cada cliente que passa por nossas portas não é apenas uma
                    transação - é parte de uma família que cresce há mais de
                    quatro décadas. É essa filosofia que nos mantém firmes,
                    relevantes e respeitados.
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1 bg-gradient-to-r from-accent-400 to-transparent rounded-full" />
                    <Award className="w-8 h-8 text-accent-400" />
                    <div className="flex-1 h-1 bg-gradient-to-l from-accent-400 to-transparent rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nosso Compromisso */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-900 mb-6">
            Nosso Compromisso com Você
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full mx-auto mb-8" />

          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Quando você escolhe a Israel Veículos, não está apenas comprando um
            carro - está se associando a uma tradição de excelência, honestidade
            e comprometimento. Nossos 42 anos de história são a garantia de que
            estaremos aqui para você, hoje e no futuro.
          </p>

          <p className="text-xl text-gray-700 leading-relaxed mb-12">
            Convidamos você a fazer parte dessa história. Visite nossa loja,
            conheça nossa equipe e descubra por que gerações de famílias confiam
            na Israel Veículos para realizar o sonho do carro próprio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center bg-accent-600 hover:bg-accent-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Ver Nosso Estoque
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
