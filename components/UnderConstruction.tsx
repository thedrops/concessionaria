import { Construction, Wrench } from "lucide-react";

interface UnderConstructionProps {
  title?: string;
  message?: string;
}

export default function UnderConstruction({
  title = "Página em Construção",
  message = "Estamos trabalhando para trazer novidades em breve.",
}: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-slate-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-12">
          {/* Ícones */}
          <div className="flex justify-center gap-4 mb-8">
            <Construction className="h-20 w-20 text-primary-500 dark:text-blue-400 animate-bounce" />
            <Wrench className="h-20 w-20 text-accent-500 dark:text-red-400 animate-pulse" />
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-slate-100 mb-4">
            {title}
          </h1>

          {/* Mensagem */}
          <p className="text-lg text-secondary-600 dark:text-slate-300 mb-8">
            {message}
          </p>

          {/* Divider */}
          <div className="border-t border-secondary-200 dark:border-slate-700 pt-8">
            <p className="text-secondary-500 dark:text-slate-300">
              Em caso de dúvidas, entre em contato pelo telefone ou WhatsApp.
            </p>
          </div>

          {/* Botão de volta */}
          <div className="mt-8">
            <a
              href="/"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
            >
              Voltar para Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
