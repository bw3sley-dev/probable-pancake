-- AlterTable
ALTER TABLE "members" ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "gender" "Gender",
ALTER COLUMN "phone" DROP NOT NULL;
