DO $$ 
BEGIN
    -- Проверяем, существует ли колонка
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'subscription'
    ) THEN
        -- Добавляем колонку, если её нет
        ALTER TABLE "User" ADD COLUMN "subscription" varchar NOT NULL DEFAULT 'free';
    END IF;
END $$; 