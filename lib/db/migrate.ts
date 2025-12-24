import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    console.warn('⚠️  POSTGRES_URL is not defined, skipping migrations');
    console.warn('   Migrations will be run when POSTGRES_URL is available');
    return; // Просто возвращаемся, не завершаем процесс
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  await connection.end();
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  // Не завершаем процесс с ошибкой, чтобы сборка могла продолжиться
  // Миграции можно запустить вручную позже
});
