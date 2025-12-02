import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PostForm from "@/components/admin/PostForm";

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Novo Post</h1>
        <p className="text-gray-600 mt-1">Crie um novo post para o blog</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <PostForm authorId={session.user.id!} />
      </div>
    </div>
  );
}
