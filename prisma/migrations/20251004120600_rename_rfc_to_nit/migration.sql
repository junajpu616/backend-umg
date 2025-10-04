-- Rename column rfc -> nit in proveedor table if it exists
-- This migration targets PostgreSQL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'proveedor'
          AND column_name = 'rfc'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'proveedor'
          AND column_name = 'nit'
    ) THEN
        ALTER TABLE "proveedor" RENAME COLUMN "rfc" TO "nit";
    END IF;
END $$;