import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserForm from "@/components/admin/UserForm";

interface PageProps {
  params: { id: string };
}

export default async function EditUserPage({ params }: PageProps) {
  const session = await auth();

  // Only ADMIN can edit users
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Usuário</h1>
        <p className="text-gray-600 mt-1">Atualize as informações do usuário</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <UserForm user={user} />
      </div>
    </div>
  );
}
