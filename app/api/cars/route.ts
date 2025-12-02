import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const carSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.string().min(4),
  version: z.string().nullable().optional(),
  transmission: z.string().nullable().optional(),
  doors: z.number().int().nullable().optional(),
  fuel: z.string().nullable().optional(),
  mileage: z.number().int().nullable().optional(),
  plate: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  price: z.number().positive(),
  optionals: z.string().nullable().optional(),
  additionalInfo: z.string().nullable().optional(),
  description: z.string(),
  images: z.array(z.string()),
  status: z.enum(["AVAILABLE", "SOLD"]).optional(),
});

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cars);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = carSchema.parse(body);

    const car = await prisma.car.create({
      data: validatedData,
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
