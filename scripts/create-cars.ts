import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createCars() {
  const cars = [
    {
      brand: "Toyota",
      model: "Corolla",
      year: "2023",
      version: "XEi 2.0",
      transmission: "Automático",
      doors: 4,
      fuel: "Flex",
      mileage: 0,
      plate: null,
      color: "Prata",
      price: 120000,
      optionals:
        "Ar condicionado, Direção elétrica, Vidros elétricos, Travas elétricas, Central multimídia",
      additionalInfo: "Veículo 0km, único dono",
      description:
        "Toyota Corolla XEi 2.0 Flex Automático 2023. Veículo completo com todos os opcionais de série.",
      images: ["/imagem-padrao-carro-nao-cadastrado.png"],
      status: "AVAILABLE" as const,
    },
    {
      brand: "Honda",
      model: "Civic",
      year: "2023",
      version: "Touring 1.5 Turbo",
      transmission: "CVT",
      doors: 4,
      fuel: "Gasolina",
      mileage: 0,
      plate: null,
      color: "Preto",
      price: 135000,
      optionals:
        "Teto solar, Bancos de couro, Sensor de estacionamento, Câmera de ré, Cruise control",
      additionalInfo: "Veículo 0km, versão topo de linha",
      description:
        "Honda Civic Touring 1.5 Turbo CVT 2023. Versão topo de linha com tecnologia de ponta.",
      images: ["/imagem-padrao-carro-nao-cadastrado.png"],
      status: "AVAILABLE" as const,
    },
    {
      brand: "Volkswagen",
      model: "Jetta",
      year: "2022",
      version: "Highline 1.4 TSI",
      transmission: "Automático",
      doors: 4,
      fuel: "Flex",
      mileage: 15000,
      plate: "ABC-1234",
      color: "Branco",
      price: 115000,
      optionals: "Ar digital, Couro, Multimídia, Rodas de liga leve",
      additionalInfo: "Único dono, todas as revisões em concessionária",
      description:
        "Volkswagen Jetta Highline 1.4 TSI 2022. Sedã premium com baixa quilometragem.",
      images: ["/imagem-padrao-carro-nao-cadastrado.png"],
      status: "AVAILABLE" as const,
    },
    {
      brand: "Chevrolet",
      model: "Onix",
      year: "2023",
      version: "Premier 1.0 Turbo",
      transmission: "Automático",
      doors: 4,
      fuel: "Flex",
      mileage: 0,
      plate: null,
      color: "Vermelho",
      price: 75000,
      optionals:
        "Ar condicionado, Direção elétrica, MyLink, Controle de tração",
      additionalInfo: "Veículo 0km, pronta entrega",
      description:
        "Chevrolet Onix Premier 1.0 Turbo 2023. Hatch premium com motor turbo e design moderno.",
      images: ["/imagem-padrao-carro-nao-cadastrado.png"],
      status: "AVAILABLE" as const,
    },
    {
      brand: "Fiat",
      model: "Argo",
      year: "2022",
      version: "Drive 1.3",
      transmission: "Manual",
      doors: 4,
      fuel: "Flex",
      mileage: 25000,
      plate: "XYZ-5678",
      color: "Azul",
      price: 68000,
      optionals:
        "Ar condicionado, Direção hidráulica, Vidros dianteiros elétricos",
      additionalInfo: "Segunda mão, bem conservado",
      description:
        "Fiat Argo Drive 1.3 Flex Manual 2022. Hatch econômico e confiável.",
      images: ["/imagem-padrao-carro-nao-cadastrado.png"],
      status: "AVAILABLE" as const,
    },
  ];

  for (const car of cars) {
    await prisma.car.create({
      data: car,
    });
    console.log(`Carro criado: ${car.brand} ${car.model}`);
  }

  console.log("Todos os carros foram criados com sucesso!");
}

createCars()
  .catch((error) => {
    console.error("Erro ao criar carros:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
