import { mkdir, unlink, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type UploadFolder = "cars" | "carousel";

const DEFAULT_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function getUploadsRoot() {
  return process.env.UPLOADS_DIR || DEFAULT_UPLOADS_DIR;
}

function sanitizeExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

function resolveUploadPath(relativePath: string) {
  const uploadsRoot = path.resolve(getUploadsRoot());
  const targetPath = path.resolve(uploadsRoot, relativePath);

  if (!targetPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error("Caminho de arquivo invalido");
  }

  return targetPath;
}

export async function saveUploadedFile({
  buffer,
  contentType,
  originalName,
  folder,
}: {
  buffer: Buffer;
  contentType: string;
  originalName: string;
  folder: UploadFolder;
}) {
  const extension = sanitizeExtension(originalName);
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const relativePath = path.posix.join(folder, fileName);
  const targetPath = resolveUploadPath(relativePath);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, buffer);

  return {
    url: `/uploads/${relativePath}`,
    filename: fileName,
    path: relativePath,
    contentType,
  };
}

export function getLocalUploadPathFromUrl(fileUrl: string): string | null {
  if (!fileUrl) return null;

  try {
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      const url = new URL(fileUrl);
      return getLocalUploadPathFromPathname(url.pathname);
    }

    return getLocalUploadPathFromPathname(fileUrl);
  } catch {
    return getLocalUploadPathFromPathname(fileUrl);
  }
}

function getLocalUploadPathFromPathname(pathname: string): string | null {
  const normalizedPath = pathname.replace(/\\/g, "/");

  if (normalizedPath.startsWith("/uploads/")) {
    return normalizeRelativeUploadPath(normalizedPath.replace("/uploads/", ""));
  }

  if (normalizedPath.includes("/storage/v1/object/public/car-images/")) {
    return normalizeRelativeUploadPath(
      normalizedPath.split("/storage/v1/object/public/car-images/")[1],
    );
  }

  if (normalizedPath.includes("/storage/v1/object/public/carousel-images/")) {
    const objectPath = normalizedPath.split(
      "/storage/v1/object/public/carousel-images/",
    )[1];
    const filePath = objectPath.startsWith("carousel/")
      ? objectPath
      : `carousel/${objectPath}`;
    return normalizeRelativeUploadPath(filePath);
  }

  if (
    normalizedPath.startsWith("cars/") ||
    normalizedPath.startsWith("carousel/")
  ) {
    return normalizeRelativeUploadPath(normalizedPath);
  }

  return null;
}

function normalizeRelativeUploadPath(relativePath: string): string | null {
  const normalized = path.posix.normalize(relativePath).replace(/^\/+/, "");

  if (
    normalized.startsWith("../") ||
    normalized === ".." ||
    path.isAbsolute(normalized)
  ) {
    return null;
  }

  if (!normalized.startsWith("cars/") && !normalized.startsWith("carousel/")) {
    return null;
  }

  return normalized;
}

export async function deleteUploadedFile(fileUrl: string) {
  const relativePath = getLocalUploadPathFromUrl(fileUrl);

  if (!relativePath) {
    return { deleted: false, reason: "not-local-upload" };
  }

  const targetPath = resolveUploadPath(relativePath);

  if (!existsSync(targetPath)) {
    return { deleted: false, reason: "not-found" };
  }

  await unlink(targetPath);
  return { deleted: true };
}
