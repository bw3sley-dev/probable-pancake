/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `areas` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `athlete_forms` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_form_id_fkey";

-- AlterTable
ALTER TABLE "athlete_forms" ADD COLUMN     "ia_observation" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "athlete_forms_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Thread" (
    "id" SERIAL NOT NULL,
    "athlete_id" TEXT NOT NULL,
    "area_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observations" (
    "id" SERIAL NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thread_id" INTEGER NOT NULL,
    "member_id" TEXT NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "athlete_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
