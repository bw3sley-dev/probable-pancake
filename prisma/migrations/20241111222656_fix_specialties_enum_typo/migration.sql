/*
  Warnings:

  - Changed the type of `name` on the `areas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Specialties" AS ENUM ('UNSPECIFIED', 'PSYCHOLOGY', 'PHYSIOTHERAPY', 'NUTRITION', 'NURSING', 'PSYCHOPEDAGOGY', 'PHYSICAL_EDUCATION');

-- AlterTable
ALTER TABLE "areas" DROP COLUMN "name",
ADD COLUMN     "name" "Specialties" NOT NULL;

-- DropEnum
DROP TYPE "Specialities";

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");
