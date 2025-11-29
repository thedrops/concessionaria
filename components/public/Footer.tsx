import Link from "next/link";
import { Car, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-accent-500" />
              <span className="font-bold text-xl">Concessionária</span>
            </div>
            <p className="text-secondary-300">
              A melhor concessionária de carros da região. Qualidade e confiança
              desde 2005.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-secondary-300 hover:text-accent-400 transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo"
                  className="text-secondary-300 hover:text-accent-400 transition"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-secondary-300 hover:text-accent-400 transition"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-secondary-300 hover:text-accent-400 transition"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-2 text-secondary-300">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>(11) 1234-5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contato@concessionaria.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Horário de Funcionamento</h3>
            <ul className="space-y-2 text-secondary-300">
              <li>Segunda a Sexta: 9h - 18h</li>
              <li>Sábado: 9h - 14h</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
          <p>
            &copy; {new Date().getFullYear()} Concessionária. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
