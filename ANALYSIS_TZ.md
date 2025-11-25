# Анализ соответствия техническому заданию

## Часть 1. База данных

### ✅ Что есть:
- **СУБД**: PostgreSQL ✓
- **Миграции**: Есть (14 файлов миграций) ✓
- **Связи между таблицами**: Все активные таблицы связаны ✓

### ❌ Что не хватает:

#### 1. Количество таблиц
**Требование**: Не менее 10 таблиц
**Текущее состояние**: 
- Активных таблиц: 6 (User, Chat, Message_v2, Vote_v2, Document, Suggestion)
- Deprecated таблиц: 2 (Message, Vote) - не считаются
- **Не хватает: 4 таблицы**

**Рекомендации для добавления**:
1. `Session` - сессии пользователей (связь с User)
2. `File` - загруженные файлы (связь с User, Document)
3. `ChatParticipant` - участники чатов (связь с Chat, User) - для публичных чатов
4. `Notification` - уведомления (связь с User)
5. `Tag` - теги для чатов/документов (связь с Chat, Document)
6. `AuditLog` - логи действий (связь с User)

#### 2. Документация БД
**Требование**: Документация по шаблону, соответствующая ГОСТ
**Текущее состояние**: ❌ Отсутствует

**Нужно создать**:
- Описание всех таблиц
- Описание связей (ER-диаграмма)
- Описание полей с типами
- Обоснование нормализации/денормализации
- По шаблону ТЗ и ГОСТ 7.32-2017

---

## Часть 2. API

### ✅ Что есть:
- **Модели данных**: Есть для всех таблиц (TypeScript типы в schema.ts) ✓
- **Миграции**: Есть ✓
- **Стек технологий**: Next.js (TypeScript) - обоснован ✓

### ❌ Что не хватает:

#### 1. Полный CRUD для всех таблиц

**User** (таблица):
- ✅ Create: `createUser()`
- ✅ Read: `getUserByEmail()`, `getUserByNickname()`
- ⚠️ Update: Частично (`updateUserSubscription()`, `updateUserCustomization()`) - нет полного update
- ❌ Delete: Отсутствует
- ❌ GetAll: Отсутствует

**Chat** (таблица):
- ✅ Create: `saveChat()`
- ✅ Read: `getChatById()`, `getChatsByUserId()`
- ⚠️ Update: Частично (`updateChatVisiblityById()`) - нет полного update
- ✅ Delete: `deleteChatById()`

**Message** (таблица):
- ✅ Create: `saveMessages()`
- ✅ Read: `getMessagesByChatId()`, `getMessageById()`
- ❌ Update: Отсутствует
- ⚠️ Delete: Частично (`deleteMessagesByChatIdAfterTimestamp()`) - нет delete по ID

**Vote** (таблица):
- ✅ Create: `voteMessage()` (insert/update)
- ✅ Read: `getVotesByChatId()`
- ✅ Update: `voteMessage()` (upsert)
- ❌ Delete: Отсутствует

**Document** (таблица):
- ✅ Create: `saveDocument()`
- ✅ Read: `getDocumentsById()`, `getDocumentById()`
- ❌ Update: Отсутствует
- ⚠️ Delete: Частично (`deleteDocumentsByIdAfterTimestamp()`) - нет delete по ID

**Suggestion** (таблица):
- ✅ Create: `saveSuggestions()`
- ✅ Read: `getSuggestionsByDocumentId()`
- ❌ Update: Отсутствует
- ❌ Delete: Отсутствует

#### 2. MVC-архитектура
**Требование**: MVC-паттерн (допускаются Repository и DTO)
**Текущее состояние**: ❌ Нет четкой структуры

**Текущая структура**:
```
app/(chat)/api/        - Route handlers (смешаны Controller + Model логика)
lib/db/queries.ts      - Model/Repository слой
```

**Нужно реорганизовать**:
```
app/api/
  controllers/         - Контроллеры (обработка запросов)
  models/             - Модели данных
  services/           - Бизнес-логика
  repositories/       - Работа с БД (или оставить queries.ts)
  dto/                - Data Transfer Objects (опционально)
```

#### 3. Документация API
**Требование**: Документация всех эндпойнтов (Postman/Swagger)
**Текущее состояние**: ❌ Отсутствует

**Нужно создать**:
- Swagger/OpenAPI документацию ИЛИ
- Postman коллекцию со всеми эндпойнтами
- Описание запросов/ответов
- Примеры использования

#### 4. Документация бизнес-логики
**Требование**: Документация всех функций (код, псевдокод или блок-схемы)
**Текущее состояние**: ❌ Отсутствует

**Нужно создать**:
- Описание функциональных процессов
- Блок-схемы (draw.io) для ключевых функций:
  - Регистрация пользователя
  - Создание чата
  - Отправка сообщения
  - Голосование за сообщение
  - Создание документа
  - Создание предложения
- Псевдокод или описание алгоритмов

#### 5. API Endpoints структура

**Текущие endpoints**:
- `/api/auth` - авторизация
- `/api/user-profile` - профиль пользователя (GET, POST)
- `/api/upgrade-subscription` - подписка (POST)
- `/api/websearch` - веб-поиск
- `/(chat)/api/chat` - чаты (POST, DELETE)
- `/(chat)/api/document` - документы (GET, POST, PATCH)
- `/(chat)/api/history` - история чатов (GET)
- `/(chat)/api/vote` - голоса (GET, PATCH)
- `/(chat)/api/suggestions` - предложения (GET)
- `/(chat)/api/files/upload` - загрузка файлов (POST)

**Проблемы**:
- Нет единой структуры (v1/, v2/)
- Нет RESTful naming (должно быть `/api/v1/users`, `/api/v1/chats`)
- Нет полного CRUD для каждой сущности

**Рекомендуемая структура**:
```
/api/v1/
  /users          - GET (all), GET/:id, POST, PUT/:id, DELETE/:id
  /chats          - GET (all), GET/:id, POST, PUT/:id, DELETE/:id
  /messages       - GET/:chatId, POST, PUT/:id, DELETE/:id
  /votes          - GET/:chatId, POST, PUT/:id, DELETE/:id
  /documents      - GET/:id, POST, PUT/:id, DELETE/:id
  /suggestions    - GET/:documentId, POST, PUT/:id, DELETE/:id
```

---

## Резюме: Что нужно сделать

### База данных:
1. ✅ Добавить минимум 4 новые таблицы (всего должно быть 10+)
2. ✅ Создать документацию БД по шаблону ТЗ
3. ✅ Создать ER-диаграмму
4. ✅ Описать нормализацию/денормализацию

### API:
1. ✅ Дополнить CRUD операции для всех таблиц:
   - User: добавить GetAll, Delete, полный Update
   - Message: добавить Update, Delete по ID
   - Vote: добавить Delete
   - Document: добавить Update, Delete по ID
   - Suggestion: добавить Update, Delete
2. ✅ Реорганизовать структуру по MVC:
   - Создать папки controllers/, models/, services/
   - Вынести бизнес-логику из route handlers
3. ✅ Создать Swagger/Postman документацию
4. ✅ Создать документацию бизнес-логики:
   - Блок-схемы для ключевых процессов
   - Описание функциональных процессов
5. ✅ Реструктурировать API endpoints:
   - Единая версионированная структура (/api/v1/)
   - RESTful naming
   - Полный CRUD для каждой сущности

### Дополнительно:
- ✅ Создать техническое задание (функционал + роли)
- ✅ Убедиться что все миграции работают корректно

---

## Оценка текущего состояния

| Критерий | Статус | Баллы |
|----------|--------|-------|
| **БД решает поставленную задачу** | ✅ | 1/1 |
| **Соответствие 3НФ** | ⚠️ Нужна проверка | ?/1 |
| **Наличие кода БД** | ✅ | 1/1 |
| **Миграции вместо ручного создания** | ✅ | 1/1 |
| **Документация БД по шаблону** | ❌ | 0/1 |
| **Документация соответствует ГОСТ** | ❌ | 0/1 |
| **Обоснованный выбор стека** | ✅ | 1/1 |
| **Наличие миграций** | ✅ | 1/1 |
| **Модели для всех таблиц** | ✅ | 1/1 |
| **Все CRUD операции** | ❌ | 0/1 |
| **Документация API** | ❌ | 0/1 |
| **Документация бизнес-логики** | ❌ | 0/3 |
| **Полное выполнение объёма работ** | ⚠️ | ?/1 |
| **ТЗ (функционал + роли)** | ❌ | 0/1 |

**Итого**: ~6-7 баллов из 15 возможных


