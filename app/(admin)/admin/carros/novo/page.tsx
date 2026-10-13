import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CarForm from "@/components/admin/CarForm";

export default async function NewCarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          Novo Carro
        </h1>
        <p className="text-gray-600 dark:text-slate-300 mt-1">
          Cadastre um novo veículo no estoque
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
        <CarForm />
      </div>
    </div>
  );
}
