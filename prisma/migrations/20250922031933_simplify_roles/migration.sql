/*
  Warnings:

  - The values [CLIENTE,MECANICO] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('USUARIO', 'PROVEEDOR', 'ADMIN');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."user" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."user" ALTER COLUMN "role" SET DEFAULT 'USUARIO';
COMMIT;

-- AlterTable
ALTER TABLE "public"."user" ALTER COLUMN "role" SET DEFAULT 'USUARIO';
