import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getImageUrl } from "@/lib/image-url";
import JSZip from "jszip";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // 1. Verificar se o usuário está autenticado
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;

    // 2. Buscar o carro com as imagens
    const car = await prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      return NextResponse.json(
        { error: "Carro não encontrado" },
        { status: 404 },
      );
    }

    if (!car.images || car.images.length === 0) {
      return NextResponse.json(
        { error: "Este carro não possui fotos cadastradas" },
        { status: 400 },
      );
    }

    // 3. Inicializar o ZIP
    const zip = new JSZip();

    // 4. Baixar/Ler e adicionar cada imagem ao ZIP
    for (let i = 0; i < car.images.length; i++) {
      const imagePath = car.images[i];
      try {
        const imgUrl = getImageUrl(imagePath);
        let imageBuffer: Buffer;

        if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
          // Baixar imagem do Supabase/External storage
          const response = await fetch(imgUrl);
          if (!response.ok) {
            throw new Error(`Erro ao baixar a imagem: ${response.statusText}`);
          }
          imageBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          // Carregar imagem local da pasta public
          const cleanLocalPath = imgUrl.startsWith("/") ? imgUrl.substring(1) : imgUrl;
          const safePath = path.join(process.cwd(), "public", cleanLocalPath);
          imageBuffer = await fs.readFile(safePath);
        }

        // Determinar a extensão correta da imagem
        const extension = imgUrl.split(".").pop()?.split("?")[0] || "jpg";
        const indexStr = String(i + 1).padStart(2, "0");
        const fileName = `${indexStr}.${extension}`;

        // Adicionar ao ZIP
        zip.file(fileName, imageBuffer);
      } catch (error) {
        console.error(`Erro ao processar imagem ${imagePath}:`, error);
        // Continuamos para tentar empacotar as demais imagens mesmo se uma falhar
      }
    }

    // 5. Gerar o arquivo ZIP final como Uint8Array
    const zipData = await zip.generateAsync({ type: "uint8array" });

    // 6. Sanitizar o nome do arquivo ZIP
    const sanitizeFilename = (str: string) => {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/[^a-z0-9]/g, "-") // substitui não-alfanumérico por hífen
        .replace(/-+/g, "-") // colapsa múltiplos hífens
        .replace(/^-|-$/g, ""); // remove hífens no início e fim
    };

    const brandSlug = sanitizeFilename(car.brand);
    const modelSlug = sanitizeFilename(car.model);
    const suffix = car.plate ? sanitizeFilename(car.plate) : car.id;
    const zipName = `${brandSlug}-${modelSlug}-${suffix}-fotos.zip`;

    // 7. Retornar a resposta com o arquivo ZIP para download
    return new NextResponse(zipData as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
        "Content-Length": String(zipData.length),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar ZIP de fotos:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar o arquivo ZIP" },
      { status: 500 },
    );
  }
}
