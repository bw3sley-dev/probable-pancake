/*
  Warnings:

  - Made the column `title` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `icon` on table `sections` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "questions" ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "sections" ALTER COLUMN "icon" SET NOT NULL;
