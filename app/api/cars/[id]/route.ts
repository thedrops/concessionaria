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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = carSchema.parse(body);

    const car = await prisma.car.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(car);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.car.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
