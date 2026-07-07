export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return "/placeholder-car.jpg"; // Imagem padrão caso não tenha
  }

  // Se já for uma URL completa (http/https), retorna como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/uploads/")) {
    return path;
  }

  if (path.startsWith("/storage/v1/object/public/")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn("NEXT_PUBLIC_SUPABASE_URL não configurado");
      return path;
    }
    // Remove a barra inicial e retorna a URL completa
    return `${supabaseUrl}${path}`;
  }

  if (path.startsWith("cars/") || path.startsWith("carousel/")) {
    return `/uploads/${path}`;
  }

  return path;
}

/**
 * Converte um array de URLs
 */
export function getImageUrls(paths: string[]): string[] {
  return paths.map(getImageUrl);
}
