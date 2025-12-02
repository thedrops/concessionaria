import { auth } from "@/auth";
import UserForm from "@/components/admin/UserForm";
import { redirect } from "next/navigation";

export default async function NewUserPage() {
  const session = await auth();

  // Only ADMIN can create users
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Novo Usuário</h1>
        <p className="text-gray-600 mt-1">
          Cadastre um novo usuário no sistema
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <UserForm />
      </div>
    </div>
  );
}
