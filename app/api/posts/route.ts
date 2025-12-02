import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, image, published, authorId } = body;

    // Validate required fields
    if (!title || !slug || !content || !authorId) {
      return NextResponse.json(
        { error: "Título, slug, conteúdo e autor são obrigatórios" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "Este slug já está em uso" },
        { status: 400 },
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        image: image || null,
        published: published || false,
        authorId,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Erro ao criar post" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");

    const where = published === "true" ? { published: true } : {};

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts" },
      { status: 500 },
    );
  }
}
