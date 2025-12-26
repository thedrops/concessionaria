import Link from "next/link";
import Logo from "../Logo";

export default function Footer() {
  return (
    <footer className="bg-[#012456] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo variant="small" width={140} height={45} />
            </div>
            <p className="text-gray-300 text-sm">
              Há mais de 42 anos crescendo com o Litoral Norte.
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
            <h3 className="font-bold text-lg mb-4">Horário de Funcionamento</h3>
            <ul className="space-y-2 text-secondary-300">
              <li>Segunda a Sexta: 9h - 18h</li>
              <li>Sábado: 9h - 14h</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Israel Veículos. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
