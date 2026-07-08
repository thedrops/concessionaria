/**
 * Atualiza as URLs de imagens no banco de dados: do formato antigo do
 * Supabase Storage para o novo formato local (/uploads/...).
 *
 * Cobre:
 *   - Car.images        (String[])
 *   - CarImage.url       (String)
 *   - CarouselImage.image (String)
 *
 * MODO DRY-RUN (padrão): só mostra o que seria alterado, não grava nada.
 *   node update-image-urls.js
 *
 * MODO APLICAR: grava as alterações no banco.
 *   node update-image-urls.js --apply
 *
 * Variáveis de ambiente opcionais para ajustar o reconhecimento das URLs antigas:
 *   SUPABASE_PROJECT_REF   (ex: "xxxxxxxxxxxx" -> usado para montar o host xxxx.supabase.co)
 *   Ou detecta automaticamente qualquer URL contendo "supabase.co/storage".
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

// Mapeia bucket/prefixo do Supabase -> pasta local final
const BUCKET_MAP = [
  { markers: ["/car-images/cars/"], localPrefix: "/uploads/cars/" },
  { markers: ["/carousel-images/carousel/"], localPrefix: "/uploads/carousel/" },
  // fallback genérico, caso o prefixo interno do bucket seja diferente do esperado
  { markers: ["/car-images/"], localPrefix: "/uploads/cars/" },
  { markers: ["/carousel-images/"], localPrefix: "/uploads/carousel/" },
];

function convertUrl(url) {
  if (!url || typeof url !== "string") return { changed: false, newUrl: url };

  // já está no formato local, não precisa mexer
  if (url.startsWith("/uploads/")) return { changed: false, newUrl: url };

  // só mexe em URLs que realmente parecem vir do Supabase Storage
  if (!url.includes("supabase.co/storage")) return { changed: false, newUrl: url };

  for (const { markers, localPrefix } of BUCKET_MAP) {
    for (const marker of markers) {
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const filename = url.slice(idx + marker.length);
        if (filename) {
          return { changed: true, newUrl: `${localPrefix}${filename}` };
        }
      }
    }
  }

  // não reconhecido: sinaliza para revisão manual, mas não altera
  return { changed: false, newUrl: url, unrecognized: true };
}

async function processCarImagesArray() {
  console.log("\n" + "=".repeat(70));
  console.log("Car.images (array)");
  console.log("=".repeat(70));

  const cars = await prisma.car.findMany({ select: { id: true, images: true } });

  let totalChanged = 0;
  let totalUnrecognized = 0;

  for (const car of cars) {
    const newImages = [];
    let carChanged = false;

    for (const url of car.images) {
      const result = convertUrl(url);
      newImages.push(result.newUrl);
      if (result.changed) carChanged = true;
      if (result.unrecognized) {
        totalUnrecognized++;
        console.log(`  [não reconhecido] car ${car.id}: ${url}`);
      }
    }

    if (carChanged) {
      totalChanged++;
      console.log(`  car ${car.id}: ${car.images.length} imagens -> atualizando`);
      if (APPLY) {
        await prisma.car.update({
          where: { id: car.id },
          data: { images: newImages },
        });
      }
    }
  }

  console.log(`\nCarros com images[] atualizadas: ${totalChanged}/${cars.length}`);
  if (totalUnrecognized > 0) {
    console.log(`URLs não reconhecidas (revisar manualmente): ${totalUnrecognized}`);
  }
}

async function processCarImageTable() {
  console.log("\n" + "=".repeat(70));
  console.log("CarImage.url");
  console.log("=".repeat(70));

  const carImages = await prisma.carImage.findMany({ select: { id: true, url: true } });

  let changed = 0;
  let unrecognized = 0;

  for (const record of carImages) {
    const result = convertUrl(record.url);
    if (result.unrecognized) {
      unrecognized++;
      console.log(`  [não reconhecido] carImage ${record.id}: ${record.url}`);
      continue;
    }
    if (result.changed) {
      changed++;
      console.log(`  carImage ${record.id}: ${record.url} -> ${result.newUrl}`);
      if (APPLY) {
        await prisma.carImage.update({
          where: { id: record.id },
          data: { url: result.newUrl },
        });
      }
    }
  }

  console.log(`\nRegistros CarImage atualizados: ${changed}/${carImages.length}`);
  if (unrecognized > 0) {
    console.log(`URLs não reconhecidas (revisar manualmente): ${unrecognized}`);
  }
}

async function processCarouselImageTable() {
  console.log("\n" + "=".repeat(70));
  console.log("CarouselImage.image");
  console.log("=".repeat(70));

  const items = await prisma.carouselImage.findMany({ select: { id: true, image: true } });

  let changed = 0;
  let unrecognized = 0;

  for (const record of items) {
    const result = convertUrl(record.image);
    if (result.unrecognized) {
      unrecognized++;
      console.log(`  [não reconhecido] carouselImage ${record.id}: ${record.image}`);
      continue;
    }
    if (result.changed) {
      changed++;
      console.log(`  carouselImage ${record.id}: ${record.image} -> ${result.newUrl}`);
      if (APPLY) {
        await prisma.carouselImage.update({
          where: { id: record.id },
          data: { image: result.newUrl },
        });
      }
    }
  }

  console.log(`\nRegistros CarouselImage atualizados: ${changed}/${items.length}`);
  if (unrecognized > 0) {
    console.log(`URLs não reconhecidas (revisar manualmente): ${unrecognized}`);
  }
}

async function main() {
  console.log(APPLY ? "MODO: APLICAR (vai gravar no banco)" : "MODO: DRY-RUN (nada será gravado)");
  if (!APPLY) {
    console.log("Para aplicar de verdade, rode novamente com: node update-image-urls.js --apply");
  }

  await processCarImagesArray();
  await processCarImageTable();
  await processCarouselImageTable();

  console.log("\n" + "=".repeat(70));
  console.log("Concluído.");
  console.log("=".repeat(70));
}

main()
  .catch((err) => {
    console.error("Erro fatal:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
