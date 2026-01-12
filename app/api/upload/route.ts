import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Detecta se está em desenvolvimento - sempre usa filesystem local em dev
const isDev = process.env.NODE_ENV === "development";

// Configurar cliente Supabase (apenas em produção)
const supabase =
  !isDev &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
    : null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "cars"; // Padrão: cars

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
    const folder = type === "carousel" ? "carousel" : "cars";
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`;

    if (isDev) {
      // MODO LOCAL: Salva no filesystem
      const uploadDir = join(process.cwd(), "public", "uploads", folder);
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const localFilename = filename.replace(`${folder}/`, "");
      const filepath = join(uploadDir, localFilename);
      await writeFile(filepath, buffer);

      const publicUrl = `/uploads/${folder}/${localFilename}`;

      return NextResponse.json({
        url: publicUrl,
        filename: localFilename,
      });
    } else {
      // MODO PRODUÇÃO: Upload para Supabase Storage
      const bucketName = type === "carousel" ? "carousel-images" : "car-images";
      const { data, error } = await supabase!.storage
        .from(bucketName)
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return NextResponse.json(
          { error: "Erro ao fazer upload no Supabase Storage" },
          { status: 500 },
        );
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase!.storage.from(bucketName).getPublicUrl(filename);

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
