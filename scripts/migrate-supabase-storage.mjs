#!/usr/bin/env node
/**
 * Migra os arquivos dos buckets do Supabase Storage para pastas locais.
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-supabase-storage.mjs
 *
 * Ou com um arquivo .env.supabase:
 *   ENV_FILE=.env.supabase node scripts/migrate-supabase-storage.mjs
 *
 * Requer: npm install --no-save @supabase/supabase-js
 */

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "fs/promises";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");

// --- Carrega .env opcional ---
const ENV_FILE = process.env.ENV_FILE;
if (ENV_FILE) {
  const envPath = join(ROOT_DIR, ENV_FILE);
  if (!existsSync(envPath)) {
    console.error(
      `Erro: ENV_FILE informado, mas arquivo nao existe: ${envPath}`,
    );
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

// --- Configuração ---
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Erro: defina NEXT_PUBLIC_SUPABASE_URL (ou SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY.",
  );
  console.error("Exemplo:");
  console.error(
    "  NEXT_PUBLIC_SUPABASE_URL='https://xxxx.supabase.co' SUPABASE_SERVICE_ROLE_KEY='xxxx' node scripts/migrate-supabase-storage.mjs",
  );
  process.exit(1);
}

const OUTPUT_DIR =
  process.env.OUTPUT_DIR || join(ROOT_DIR, "backups", "supabase-storage");

// bucket -> { storagePrefix, outputSubdir }
const BUCKETS = [
  { bucket: "car-images", storagePrefix: "cars", outputSubdir: "cars" },
  {
    bucket: "carousel-images",
    storagePrefix: "carousel",
    outputSubdir: "carousel",
  },
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listAllFiles(bucket, prefix) {
  const allFiles = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      throw new Error(`Erro ao listar ${bucket}/${prefix}: ${error.message}`);
    }
    if (!data || data.length === 0) break;

    // Ignora "pastas" (entradas sem id/metadata), só queremos arquivos
    const files = data.filter((item) => item.id !== null);
    allFiles.push(...files);

    if (data.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

async function downloadFile(bucket, storagePrefix, filename, destDir) {
  const remotePath = `${storagePrefix}/${filename}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(remotePath);

  if (error) {
    throw new Error(`Erro ao baixar ${bucket}/${remotePath}: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const destPath = join(destDir, filename);
  await writeFile(destPath, buffer);
  return buffer.length;
}

async function migrateBucket({ bucket, storagePrefix, outputSubdir }) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`Bucket: ${bucket} (pasta: ${storagePrefix})`);
  console.log("=".repeat(70));

  const destDir = join(OUTPUT_DIR, outputSubdir);
  await mkdir(destDir, { recursive: true });

  console.log("Listando arquivos...");
  const files = await listAllFiles(bucket, storagePrefix);
  console.log(`Encontrados ${files.length} arquivos.`);

  let downloaded = 0;
  let failed = 0;
  let totalBytes = 0;
  const failedFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    process.stdout.write(`  [${i + 1}/${files.length}] ${file.name}... `);
    try {
      const size = await downloadFile(
        bucket,
        storagePrefix,
        file.name,
        destDir,
      );
      totalBytes += size;
      downloaded++;
      console.log(`ok (${(size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      failed++;
      failedFiles.push(file.name);
      console.log(`FALHOU: ${err.message}`);
    }
  }

  console.log(`\nResumo do bucket ${bucket}:`);
  console.log(`  Baixados: ${downloaded}/${files.length}`);
  console.log(`  Falharam: ${failed}`);
  console.log(`  Tamanho total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  if (failedFiles.length > 0) {
    console.log(`  Arquivos com falha: ${failedFiles.join(", ")}`);
  }

  return { bucket, downloaded, failed, totalBytes, failedFiles };
}

async function main() {
  console.log("Iniciando migração de arquivos do Supabase Storage...");
  console.log(`Destino local: ${OUTPUT_DIR}`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const results = [];
  for (const bucketConfig of BUCKETS) {
    const result = await migrateBucket(bucketConfig);
    results.push(result);
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("RESUMO GERAL");
  console.log("=".repeat(70));

  let totalDownloaded = 0;
  let totalFailed = 0;
  let hasFailures = false;

  for (const r of results) {
    console.log(`${r.bucket}: ${r.downloaded} ok, ${r.failed} falhas`);
    totalDownloaded += r.downloaded;
    totalFailed += r.failed;
    if (r.failed > 0) hasFailures = true;
  }

  console.log(`\nTotal baixado: ${totalDownloaded}`);
  console.log(`Total de falhas: ${totalFailed}`);
  console.log(`\nArquivos salvos em: ${OUTPUT_DIR}`);
  console.log("\nPróximo passo: envie essa pasta para a VPS, por exemplo:");
  console.log(
    `  scp -r "${OUTPUT_DIR}/cars"      usuario@IP_DA_VPS:/opt/concessionaria/storage/uploads/cars`,
  );
  console.log(
    `  scp -r "${OUTPUT_DIR}/carousel"  usuario@IP_DA_VPS:/opt/concessionaria/storage/uploads/carousel`,
  );

  if (hasFailures) {
    console.log(
      "\n⚠️  Houve falhas no download. Rode o script novamente antes de migrar — ele vai",
    );
    console.log(
      "    tentar baixar tudo de novo (arquivos já existentes serão sobrescritos).",
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("\nErro fatal:", err);
  process.exit(1);
});
