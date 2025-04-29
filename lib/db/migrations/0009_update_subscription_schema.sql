-- Обновляем тип поля subscription
ALTER TABLE "User" ALTER COLUMN "subscription" TYPE varchar;

-- Устанавливаем дефолтное значение
ALTER TABLE "User" ALTER COLUMN "subscription" SET DEFAULT 'free';

-- Обновляем существующие записи
UPDATE "User" SET "subscription" = 'free' WHERE "subscription" IS NULL OR "subscription" NOT IN ('free', 'starter', 'starter_plus', 'premium', 'ultimate'); 