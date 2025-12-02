import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Erro ao buscar post" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, image, published } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Título, slug e conteúdo são obrigatórios" },
        { status: 400 },
      );
    }

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 },
      );
    }

    // Check if slug is already taken by another post
    if (slug !== existingPost.slug) {
      const slugTaken = await prisma.post.findUnique({
        where: { slug },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: "Este slug já está em uso" },
          { status: 400 },
        );
      }
    }

    // Update post
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        image: image || null,
        published: published || false,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar post" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 },
      );
    }

    // Delete post
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Post excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Erro ao excluir post" },
      { status: 500 },
    );
  }
}
