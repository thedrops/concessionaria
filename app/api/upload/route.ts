import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Detecta se está em desenvolvimento sem R2 configurado
const isDev =
  process.env.NODE_ENV === "development" && !process.env.R2_ENDPOINT;

// Configurar cliente R2 (apenas se as credenciais estiverem configuradas)
const s3Client = !isDev
  ? new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 },
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP." },
        { status: 400 },
      );
    }

    // Validar tamanho (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 5MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const filename = `cars/${timestamp}-${randomString}.${extension}`;

    if (isDev) {
      // MODO LOCAL: Salva no filesystem
      const uploadDir = join(process.cwd(), "public", "uploads", "cars");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const localFilename = filename.replace("cars/", "");
      const filepath = join(uploadDir, localFilename);
      await writeFile(filepath, buffer);

      const publicUrl = `/uploads/cars/${localFilename}`;

      return NextResponse.json({
        url: publicUrl,
        filename: localFilename,
      });
    } else {
      // MODO PRODUÇÃO: Upload para Cloudflare R2
      await s3Client!.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: filename,
          Body: buffer,
          ContentType: file.type,
        }),
      );

      const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;

      return NextResponse.json({
        url: publicUrl,
        filename,
      });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 },
    );
  }
}
