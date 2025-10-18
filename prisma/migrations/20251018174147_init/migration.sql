/*
  Warnings:

  - The `imagenUrl` column on the `producto` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "producto" DROP COLUMN "imagenUrl",
ADD COLUMN     "imagenUrl" TEXT[];
