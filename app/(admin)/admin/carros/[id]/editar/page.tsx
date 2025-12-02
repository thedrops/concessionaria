import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CarForm from "@/components/admin/CarForm";

interface PageProps {
  params: { id: string };
}

export default async function EditCarPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const car = await prisma.car.findUnique({
    where: { id: params.id },
  });

  if (!car) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Carro</h1>
        <p className="text-gray-600 mt-1">Atualize as informações do veículo</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CarForm car={car} />
      </div>
    </div>
  );
}
