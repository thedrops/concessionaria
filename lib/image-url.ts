/**
 * Converte URLs de imagens locais para URLs do Supabase Storage
 *
 * @param path - Caminho da imagem (ex: /uploads/cars/image.jpg)
 * @returns URL completa do Supabase Storage
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return "/placeholder-car.jpg"; // Imagem padrão caso não tenha
  }

  // Se já for uma URL completa (http/https), retorna como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Se for um caminho local (/uploads/cars/...)
  if (path.startsWith("/uploads/cars/")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      console.warn(
        "NEXT_PUBLIC_SUPABASE_URL não configurado, usando caminho local",
      );
      return path;
    }

    // Extrai apenas o nome do arquivo
    const fileName = path.replace("/uploads/cars/", "");

    // Monta a URL do Supabase Storage
    // Padrão: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    return `${supabaseUrl}/storage/v1/object/public/car-images/cars/${fileName}`;
  }

  // Retorna o path original se não corresponder aos padrões acima
  return path;
}

/**
 * Converte um array de URLs
 */
export function getImageUrls(paths: string[]): string[] {
  return paths.map(getImageUrl);
}
