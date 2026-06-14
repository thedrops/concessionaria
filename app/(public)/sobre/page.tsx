import { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  CheckCircle,
  Handshake,
  Shield,
  Target,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre a Israel Veículos",
  description:
    "Conheça a Israel Veículos, concessionária de seminovos e usados com atendimento transparente e veículos selecionados.",
};

const values = [
  {
    icon: Target,
    title: "Missão",
    description:
      "Conectar clientes a veículos de qualidade com orientação clara, atendimento próximo e negociação transparente.",
  },
  {
    icon: Shield,
    title: "Visão",
    description:
      "Ser referência regional em seminovos e usados pela confiança construída antes, durante e depois da venda.",
  },
  {
    icon: CheckCircle,
    title: "Valores",
    description:
      "Transparência, responsabilidade, respeito ao cliente e cuidado na seleção de cada veículo anunciado.",
  },
];

const timeline = [
  {
    year: "1984",
    title: "Início da trajetória",
    description: "A Israel Veículos inicia sua atuação no mercado automotivo.",
  },
  {
    year: "2000",
    title: "Relacionamento local",
    description:
      "A loja fortalece sua presença e atende novas gerações de clientes.",
  },
  {
    year: "2015",
    title: "Estoque mais completo",
    description: "Ampliação da oferta de seminovos e usados selecionados.",
  },
  {
    year: "Hoje",
    title: "Atendimento digital",
    description: "Catálogo online, contato facilitado e suporte consultivo.",
  },
];

export default function SobrePage() {
  return (
    <div className="bg-white">
      <section className="bg-primary text-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              Israel Veículos
            </p>
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
              Sobre a Israel Veículos
            </h1>
            <p className="text-xl text-blue-50 leading-relaxed">
              Uma concessionária focada em veículos seminovos e usados, com
              atendimento consultivo, transparência e compromisso com cada
              negociação.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="rounded-lg bg-secondary-50 p-8 border border-secondary-100">
              <Award className="h-10 w-10 text-primary mb-5" />
              <p className="text-5xl font-display font-bold text-secondary-900 mb-2">
                40+
              </p>
              <p className="text-lg font-semibold text-secondary-900 mb-4">
                anos de história
              </p>
              <p className="text-secondary-600 leading-relaxed">
                Tradição construída com presença local, atendimento próximo e
                compromisso em entregar veículos bem selecionados.
              </p>
            </div>
            <div>
              <h2 className="text-4xl font-display font-bold text-secondary-900 mb-5">
                Uma história de confiança
              </h2>
              <div className="section-divider w-24 mb-6" />
              <p className="text-lg text-secondary-600 leading-relaxed mb-4">
                A Israel Veículos atua para simplificar a compra de seminovos e
                usados. A equipe acompanha o cliente desde a escolha do modelo
                até os detalhes de documentação, financiamento e entrega.
              </p>
              <p className="text-lg text-secondary-600 leading-relaxed">
                O objetivo é oferecer uma experiência objetiva, respeitosa e
                segura, com informações claras sobre cada veículo e atendimento
                preparado para orientar a melhor decisão.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-secondary-900 mb-3">
              Missão, Visão e Valores
            </h2>
            <p className="text-lg text-secondary-500">
              Princípios que orientam o atendimento e a curadoria do estoque.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((item) => (
              <div
                key={item.title}
                className="card-hover rounded-lg bg-white p-6 border border-secondary-100 shadow-sm"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl font-display font-bold text-secondary-900 mb-3">
              Nossa trajetória
            </h2>
            <p className="text-lg text-secondary-500">
              Marcos que representam evolução, permanência e atendimento.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {timeline.map((item) => (
              <div
                key={item.year}
                className="rounded-lg border border-secondary-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-800 font-bold text-white">
                  {item.year === "Hoje" ? "Atual" : item.year.slice(2)}
                </div>
                <p className="text-sm font-semibold text-primary mb-2">
                  {item.year}
                </p>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-secondary-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  Equipe consultiva
                </h3>
                <p className="text-secondary-600">
                  Atendimento direto para entender necessidade, orçamento e uso.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Handshake className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  Parcerias
                </h3>
                <p className="text-secondary-600">
                  Apoio em financiamento, documentação e etapas de compra.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  Segurança
                </h3>
                <p className="text-secondary-600">
                  Veículos anunciados com informações claras e suporte da
                  equipe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Quer conhecer nosso estoque?
          </h2>
          <p className="text-lg text-blue-50 mb-8">
            Veja os veículos disponíveis ou fale com a equipe da Israel
            Veículos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-4 font-semibold text-primary hover:bg-blue-50"
            >
              Ver Catálogo
            </Link>
            <a
              href="tel:+5512974088993"
              className="inline-flex items-center justify-center rounded-lg border border-white px-7 py-4 font-semibold text-white hover:bg-white/10"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
