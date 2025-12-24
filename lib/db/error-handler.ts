// NOTE:
// Раньше здесь регистрировались глобальные обработчики через process.on
// для unhandledRejection / uncaughtException, чтобы мягко логировать
// таймауты базы данных.
//
// Однако использование process.on запрещено в Edge Runtime (Next.js middleware),
// а этот файл импортируется в цепочке:
//   lib/db/queries.ts -> app/(auth)/auth.ts -> middleware.ts
//
// Из‑за этого даже защищённое обращение к process.on вызывает
// статическую ошибку сборки:
//   "A Node.js API is used (process.on) which is not supported in the Edge Runtime".
//
// Поэтому все вызовы process.on удалены. При необходимости
// глобальные хендлеры можно добавить в отдельный Node‑only entrypoint
// (например, в server/index.ts), который не попадает в Edge.

export {};
