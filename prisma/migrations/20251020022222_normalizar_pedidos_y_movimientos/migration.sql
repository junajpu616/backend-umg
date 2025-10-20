/*
  Warnings:

  - You are about to drop the column `tipo` on the `movimiento` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `pedido` table. All the data in the column will be lost.
  - Added the required column `tipoId` to the `movimiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estadoId` to the `pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movimiento" DROP COLUMN "tipo",
ADD COLUMN     "tipoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pedido" DROP COLUMN "estado",
ADD COLUMN     "estadoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "estado_pedido" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_movimiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estado_pedido_nombre_key" ON "estado_pedido"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_movimiento_nombre_key" ON "tipo_movimiento"("nombre");

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estado_pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento" ADD CONSTRAINT "movimiento_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipo_movimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
