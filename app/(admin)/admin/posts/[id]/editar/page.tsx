import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

interface PageProps {
  params: { id: string };
}

export default async function EditPostPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Editar Post</h1>
        <p className="text-gray-600 mt-1">Atualize as informações do post</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <PostForm post={post} authorId={session.user.id!} />
      </div>
    </div>
  );
}
