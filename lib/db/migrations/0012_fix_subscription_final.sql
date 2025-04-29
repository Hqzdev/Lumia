-- Сначала удаляем все существующие миграции subscription
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscription";

-- Создаем колонку заново с правильными параметрами
ALTER TABLE "User" ADD COLUMN "subscription" varchar(20) NOT NULL DEFAULT 'free';

-- Создаем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS "User_subscription_idx" ON "User" ("subscription");

-- Обновляем все существующие записи
UPDATE "User" SET "subscription" = 'free' WHERE "subscription" IS NULL; 