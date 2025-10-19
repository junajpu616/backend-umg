/*
  Warnings:

  - You are about to drop the column `categoria` on the `producto` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `producto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "producto" DROP COLUMN "categoria",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
