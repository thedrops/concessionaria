"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const postSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  slug: z
    .string()
    .min(3, "Slug deve ter no mínimo 3 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    ),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Conteúdo deve ter no mínimo 10 caracteres"),
  image: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
  published: z.boolean(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    image: string | null;
    published: boolean;
  };
  authorId: string;
}

export default function PostForm({ post, authorId }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: post
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          content: post.content,
          image: post.image || "",
          published: post.published,
        }
      : {
          published: false,
        },
  });

  const title = watch("title");

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (!post) {
      // Only auto-generate slug for new posts
      setValue("slug", generateSlug(newTitle));
    }
  };

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const url = post ? `/api/posts/${post.id}` : "/api/posts";
      const method = post ? "PUT" : "POST";

      const payload = {
        ...data,
        authorId,
        excerpt: data.excerpt || null,
        image: data.image || null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar post");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Título *
          </label>
          <input
            {...register("title")}
            onChange={(e) => {
              register("title").onChange(e);
              handleTitleChange(e);
            }}
            type="text"
            id="title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Título do post"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Slug *
          </label>
          <input
            {...register("slug")}
            type="text"
            id="slug"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="slug-do-post"
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            URL amigável (apenas letras minúsculas, números e hífens)
          </p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Resumo
          </label>
          <textarea
            {...register("excerpt")}
            id="excerpt"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Breve resumo do post (opcional)"
          />
          {errors.excerpt && (
            <p className="mt-1 text-sm text-red-600">
              {errors.excerpt.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            URL da Imagem
          </label>
          <input
            {...register("image")}
            type="text"
            id="image"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Conteúdo *
          </label>
          <textarea
            {...register("content")}
            id="content"
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            placeholder="Conteúdo do post (aceita Markdown)"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Você pode usar Markdown para formatar o texto
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              {...register("published")}
              type="checkbox"
              id="published"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="published"
              className="ml-2 block text-sm text-gray-900"
            >
              Publicar post
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500 ml-6">
            Posts não publicados ficam salvos como rascunho
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>{post ? "Atualizar Post" : "Criar Post"}</>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
