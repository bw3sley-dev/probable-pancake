/*
  Warnings:

  - You are about to drop the column `area` on the `members` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Specialities" AS ENUM ('UNSPECIFIED', 'PSYCHOLOGY', 'PHYSIOTHERAPY', 'NUTRITION', 'NURSING', 'PSYCHOPEDAGOGY', 'PHYSICAL_EDUCATION');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "Handedness" AS ENUM ('RIGHT', 'LEFT');

-- AlterTable
ALTER TABLE "members" DROP COLUMN "area";

-- DropEnum
DROP TYPE "Area";

-- CreateTable
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "name" "Specialities" NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_areas" (
    "member_id" TEXT NOT NULL,
    "area_id" INTEGER NOT NULL,

    CONSTRAINT "member_areas_pkey" PRIMARY KEY ("member_id","area_id")
);

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "handedness" "Handedness" NOT NULL,
    "blood_type" "BloodType" NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "member_id" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,
    "guardianId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "street" TEXT,
    "neighborhood" TEXT,
    "postal_code" TEXT,
    "complement" TEXT,
    "number" TEXT,
    "city" TEXT,
    "uf" TEXT,
    "country" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "relationship_degree" TEXT,
    "gender" "Gender",
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "athletes_addressId_key" ON "athletes"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "athletes_guardianId_key" ON "athletes"("guardianId");

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
