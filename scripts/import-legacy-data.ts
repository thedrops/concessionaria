import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as readline from "readline";

const prisma = new PrismaClient();

interface LegacyVehicle {
  id: number;
  marca: string;
  modelo: string;
  ano: string;
  versao: string;
  cambio: string;
  porta: number;
  combustivel: string;
  quilometragem: number;
  placa: string;
  valor: number;
  cor: string;
  opcionais: string | null;
  informacoes_adicionais: string | null;
  deleted_at: string | null;
}

interface LegacyPhoto {
  id: number;
  veiculo_id: number;
  path: string;
  ordem: number;
}

async function parseSQLFile(filePath: string) {
  const vehicles: LegacyVehicle[] = [];
  const photos: LegacyPhoto[] = [];

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentInsertType: "vehicles" | "photos" | null = null;
  let buffer = "";

  for await (const line of rl) {
    // Detecta início de INSERT para veículos
    if (line.includes("INSERT INTO `veiculos`")) {
      currentInsertType = "vehicles";
      buffer = line;
      continue;
    }

    // Detecta início de INSERT para fotos
    if (line.includes("INSERT INTO `fotos`")) {
      currentInsertType = "photos";
      buffer = line;
      continue;
    }

    // Acumula linhas do INSERT
    if (currentInsertType && line.trim()) {
      buffer += " " + line;

      // Se terminou o INSERT (linha termina com ;)
      if (line.trim().endsWith(";")) {
        if (currentInsertType === "vehicles") {
          parseVehicleInsert(buffer, vehicles);
        } else if (currentInsertType === "photos") {
          parsePhotoInsert(buffer, photos);
        }
        currentInsertType = null;
        buffer = "";
      }
    }
  }

  return { vehicles, photos };
}

function parseVehicleInsert(
  insertStatement: string,
  vehicles: LegacyVehicle[],
) {
  // Extrai os VALUES do INSERT
  const valuesMatch = insertStatement.match(/VALUES\s+(.+);?$/s);
  if (!valuesMatch) return;

  const valuesStr = valuesMatch[1];

  // Divide por tuplas (...)
  const tupleRegex = /\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g;
  let match;

  while ((match = tupleRegex.exec(valuesStr)) !== null) {
    const values = match[1];
    const parts = parseValues(values);

    if (parts.length >= 14) {
      vehicles.push({
        id: parseInt(parts[0]),
        marca: parts[1],
        modelo: parts[2],
        ano: parts[3],
        versao: parts[4],
        cambio: parts[5],
        porta: parseInt(parts[6]),
        combustivel: parts[7],
        quilometragem: parseInt(parts[8]),
        placa: parts[9],
        valor: parseFloat(parts[10]),
        cor: parts[11],
        opcionais: parts[12] === "NULL" ? null : parts[12],
        informacoes_adicionais: parts[13] === "NULL" ? null : parts[13],
        deleted_at: parts[14] === "NULL" ? null : parts[14],
      });
    }
  }
}

function parsePhotoInsert(insertStatement: string, photos: LegacyPhoto[]) {
  const valuesMatch = insertStatement.match(/VALUES\s+(.+);?$/s);
  if (!valuesMatch) return;

  const valuesStr = valuesMatch[1];
  const tupleRegex = /\(([^)]+)\)/g;
  let match;

  while ((match = tupleRegex.exec(valuesStr)) !== null) {
    const values = match[1];
    const parts = parseValues(values);

    if (parts.length >= 4) {
      photos.push({
        id: parseInt(parts[0]),
        veiculo_id: parseInt(parts[1]),
        path: parts[2],
        ordem: parseInt(parts[3]),
      });
    }
  }
}

function parseValues(valuesStr: string): string[] {
  const parts: string[] = [];
  let current = "";
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];

    if (
      (char === "'" || char === '"') &&
      (i === 0 || valuesStr[i - 1] !== "\\")
    ) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      } else {
        current += char;
      }
    } else if (char === "," && !inString) {
      parts.push(current.trim());
      current = "";
    } else if (!inString && char === " " && current === "") {
      // Skip leading spaces outside strings
      continue;
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(current.trim());
  }

  return parts;
}

function groupPhotosByVehicle(photos: LegacyPhoto[]): Map<number, string[]> {
  const grouped = new Map<number, string[]>();

  // Agrupa por veiculo_id e ordena por ordem
  photos.sort((a, b) => {
    if (a.veiculo_id === b.veiculo_id) {
      return a.ordem - b.ordem;
    }
    return a.veiculo_id - b.veiculo_id;
  });

  for (const photo of photos) {
    if (!grouped.has(photo.veiculo_id)) {
      grouped.set(photo.veiculo_id, []);
    }
    // Converte para o formato esperado pela aplicação
    grouped.get(photo.veiculo_id)!.push(`/uploads/cars/${photo.path}`);
  }

  return grouped;
}

async function importData() {
  try {
    console.log("📖 Lendo arquivo SQL...");
    const { vehicles, photos } = await parseSQLFile(
      "./u430347056_israelveiculos.sql",
    );

    console.log(`✓ Encontrados ${vehicles.length} veículos`);
    console.log(`✓ Encontradas ${photos.length} fotos`);

    // Filtra apenas veículos ativos (deleted_at = NULL)
    const activeVehicles = vehicles.filter((v) => v.deleted_at === null);
    console.log(`✓ ${activeVehicles.length} veículos ativos (sem deleted_at)`);

    // Agrupa fotos por veículo
    const photosByVehicle = groupPhotosByVehicle(photos);

    // Limpa dados existentes
    console.log("\n🗑️  Removendo veículos existentes...");
    await prisma.car.deleteMany();
    console.log("✓ Veículos removidos");

    // Importa cada veículo
    console.log("\n📦 Importando veículos...");
    let imported = 0;
    let skipped = 0;

    for (const vehicle of activeVehicles) {
      try {
        const images = photosByVehicle.get(vehicle.id) || [];

        await prisma.car.create({
          data: {
            brand: vehicle.marca,
            model: vehicle.modelo,
            year: vehicle.ano,
            version: vehicle.versao || null,
            transmission: vehicle.cambio || null,
            doors: vehicle.porta || null,
            fuel: vehicle.combustivel || null,
            mileage: vehicle.quilometragem || null,
            plate: vehicle.placa || null,
            color: vehicle.cor || null,
            price: vehicle.valor,
            optionals: vehicle.opcionais || null,
            additionalInfo: vehicle.informacoes_adicionais || null,
            description: `${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`, // Descrição gerada
            images: images,
            status: "AVAILABLE",
          },
        });

        imported++;
        console.log(
          `  ✓ ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano} (${images.length} fotos)`,
        );
      } catch (error: any) {
        console.log(
          `  ✗ Erro ao importar ${vehicle.marca} ${vehicle.modelo}: ${error.message}`,
        );
        skipped++;
      }
    }

    console.log(`\n✅ Importação concluída!`);
    console.log(`   - ${imported} veículos importados`);
    console.log(`   - ${skipped} veículos com erro`);

    console.log("\n💡 IMPORTANTE: As imagens não foram copiadas fisicamente.");
    console.log("   Para exibir as imagens, você precisa:");
    console.log(
      "   1. Copiar os arquivos .jpg do sistema antigo para /public/uploads/cars/",
    );
    console.log("   2. Ou atualizar os paths das imagens no banco de dados");
  } catch (error) {
    console.error("❌ Erro na importação:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
