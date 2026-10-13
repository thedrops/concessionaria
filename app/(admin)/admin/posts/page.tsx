import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DeletePostButton from "@/components/admin/DeletePostButton";

interface PageProps {
  searchParams: { page?: string };
}

export default async function PostsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const page = Number(searchParams.page) || 1;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.post.count(),
  ]);

  const totalPages = Math.ceil(totalPosts / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">
            Posts
          </h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">
            Gerencie os posts do blog
          </p>
        </div>
        <Link
          href="/admin/posts/novo"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600/90 transition-colors shadow-md font-semibold text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Criar Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Total de Posts
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">
            {totalPosts}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Publicados
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {posts.filter((p) => p.published).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 dark:text-slate-300">
            Rascunhos
          </h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-slate-300 mt-2">
            {posts.filter((p) => !p.published).length}
          </p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
          {posts.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-slate-300">
              Nenhum post cadastrado
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-slate-100 leading-snug">
                      {post.title}
                    </p>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 dark:text-slate-300 line-clamp-2 mt-0.5">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          post.published
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100"
                        }`}
                      >
                        {post.published ? "Publicado" : "Rascunho"}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-400">
                        {post.author.name} &bull;{" "}
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 min-h-[44px] px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver</span>
                    </Link>
                  )}
                  <Link
                    href={`/admin/posts/${post.id}/editar`}
                    className="flex items-center gap-1 text-sm text-primary dark:text-blue-400 hover:text-primary/80 min-h-[44px] px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </Link>
                  <DeletePostButton postId={post.id} postTitle={post.title} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-slate-300"
                  >
                    Nenhum post cadastrado
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {post.title}
                          </div>
                          {post.excerpt && (
                            <div className="text-sm text-gray-500 dark:text-slate-300 line-clamp-2 max-w-md">
                              {post.excerpt}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-slate-100">
                        {post.author.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-100"
                        }`}
                      >
                        {post.published ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                      {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {post.published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                            title="Ver post"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/posts/${post.id}/editar`}
                          className="text-primary dark:text-blue-400 hover:text-primary/80"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <DeletePostButton
                          postId={post.id}
                          postTitle={post.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* end desktop table */}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Link
                href={`/admin/posts?page=${Math.max(1, page - 1)}`}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                  page === 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Anterior
              </Link>
              <Link
                href={`/admin/posts?page=${Math.min(totalPages, page + 1)}`}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Próxima
              </Link>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-slate-200">
                  Mostrando <span className="font-medium">{skip + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(skip + perPage, totalPosts)}
                  </span>{" "}
                  de <span className="font-medium">{totalPosts}</span>{" "}
                  resultados
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Link
                    href={`/admin/posts?page=${Math.max(1, page - 1)}`}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    Anterior
                  </Link>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Link
                          key={pageNum}
                          href={`/admin/posts?page=${pageNum}`}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === page
                              ? "z-10 bg-primary border-primary text-white"
                              : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <span
                          key={pageNum}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-gray-700 dark:text-slate-200"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <Link
                    href={`/admin/posts?page=${Math.min(totalPages, page + 1)}`}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  >
                    Próxima
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
