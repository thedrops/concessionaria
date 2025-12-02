/*
  Warnings:

  - A unique constraint covering the columns `[plate]` on the table `cars` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cars" ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "doors" INTEGER,
ADD COLUMN     "fuel" TEXT,
ADD COLUMN     "mileage" INTEGER,
ADD COLUMN     "optionals" TEXT,
ADD COLUMN     "plate" TEXT,
ADD COLUMN     "transmission" TEXT,
ADD COLUMN     "version" TEXT,
ALTER COLUMN "year" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cars_plate_key" ON "cars"("plate");
