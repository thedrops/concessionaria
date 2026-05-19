import Link from "next/link";
import Logo from "../Logo";
import { Facebook, Instagram, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="mb-4">
              <Logo variant="small" width={140} height={45} />
            </div>
            <p className="text-primary-100 text-sm leading-relaxed">
              Há mais de 15 anos oferecendo os melhores veículos seminovos e
              usados com qualidade garantida e atendimento personalizado.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-accent-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-accent-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-accent-400">
              Links Rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-primary-100 hover:text-accent-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo"
                  className="text-primary-100 hover:text-accent-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Catálogo
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-primary-100 hover:text-accent-400 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Sobre
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-accent-400 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Horário
            </h3>
            <ul className="space-y-3 text-primary-100">
              <li className="flex justify-between">
                <span>Seg - Sex:</span>
                <span className="font-semibold">08:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado:</span>
                <span className="font-semibold">08:00 - 13:00</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo:</span>
                <span className="font-semibold text-secondary-400">
                  Fechado
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6 text-accent-400">
              Contato
            </h3>
            <ul className="space-y-4 text-primary-100">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Telefone</p>
                  <a
                    href="tel:+5512974088993"
                    className="hover:text-accent-400 transition-colors"
                  >
                    (12) 97408-8993
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">E-mail</p>
                  <a
                    href="mailto:contato@israelveiculos.com.br"
                    className="hover:text-accent-400 transition-colors"
                  >
                    contato@israelveiculos.com.br
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Endereço</p>
                  <p className="text-sm">
                    Rua Exemplo, 123
                    <br />
                    Cidade - Estado
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-200 text-sm">
              &copy; {new Date().getFullYear()} Israel Veículos. Todos os
              direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-primary-200">
              <Link
                href="/privacidade"
                className="hover:text-accent-400 transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/termos"
                className="hover:text-accent-400 transition-colors"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
