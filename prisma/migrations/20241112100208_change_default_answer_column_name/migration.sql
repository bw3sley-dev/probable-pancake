/*
  Warnings:

  - You are about to drop the column `defaultValue` on the `questions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "questions" DROP COLUMN "defaultValue",
ADD COLUMN     "defaultAnswer" TEXT DEFAULT 'default_answer';
