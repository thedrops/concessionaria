import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Criando usuário administrador...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@concessionaria.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@concessionaria.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuário admin criado com sucesso!");
  console.log("Email: admin@concessionaria.com");
  console.log("Senha: admin123");
  console.log("\n⚠️  Lembre-se de alterar a senha após o primeiro login!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar usuário:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
