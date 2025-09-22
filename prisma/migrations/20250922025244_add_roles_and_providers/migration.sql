/*
  Warnings:

  - You are about to drop the `Movimiento` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoria` to the `producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proveedorId` to the `producto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CLIENTE', 'MECANICO', 'PROVEEDOR', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."Movimiento" DROP CONSTRAINT "Movimiento_productoId_fkey";

-- AlterTable
ALTER TABLE "public"."producto" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "categoria" TEXT NOT NULL,
ADD COLUMN     "imagenUrl" TEXT,
ADD COLUMN     "proveedorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'CLIENTE',
ADD COLUMN     "telefono" TEXT;

-- DropTable
DROP TABLE "public"."Movimiento";

-- CreateTable
CREATE TABLE "public"."proveedor" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nombreComercial" TEXT NOT NULL,
    "rfc" TEXT,
    "direccion" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "telefono" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pedido" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "comision" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pedido_item" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movimiento" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proveedor_userId_key" ON "public"."proveedor"("userId");

-- AddForeignKey
ALTER TABLE "public"."proveedor" ADD CONSTRAINT "proveedor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."producto" ADD CONSTRAINT "producto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "public"."proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedido" ADD CONSTRAINT "pedido_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedido_item" ADD CONSTRAINT "pedido_item_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "public"."pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedido_item" ADD CONSTRAINT "pedido_item_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimiento" ADD CONSTRAINT "movimiento_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
