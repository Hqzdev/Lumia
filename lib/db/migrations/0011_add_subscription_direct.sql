-- Удаляем колонку если она существует (на всякий случай)
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscription";

-- Добавляем колонку заново
ALTER TABLE "User" ADD COLUMN "subscription" varchar NOT NULL DEFAULT 'free';

-- Обновляем существующие записи
UPDATE "User" SET "subscription" = 'free'; 