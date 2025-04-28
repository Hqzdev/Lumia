ALTER TABLE "User" ALTER COLUMN "subscription" SET DEFAULT 'free';
-- В PostgreSQL нет строгого enum для varchar, просто меняем дефолт и значения на уровне приложения.
-- Если есть пользователи с другими значениями, их можно обновить так:
UPDATE "User" SET "subscription" = 'free' WHERE "subscription" NOT IN ('free', 'starter', 'starter_plus', 'premium', 'ultimate'); 