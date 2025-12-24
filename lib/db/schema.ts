import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
} from 'drizzle-orm/pg-core';

// User - реальная структура БД (subscription и customization в самой таблице)
export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  nickname: varchar('nickname', { length: 32 }).notNull().unique(),
  subscription: varchar('subscription', { length: 20 }).notNull().default('free'),
  customization: json('customization'),
});

export type User = InferSelectModel<typeof user>;

// UserSettings - для будущей миграции (пока не используется)
export const userSettings = pgTable('UserSettings', {
  userId: uuid('userId')
    .primaryKey()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  subscription: varchar('subscription', { length: 20 }).notNull().default('free'),
  customization: json('customization'),
});

export type UserSettings = InferSelectModel<typeof userSettings>;

// Chat - реальная структура БД (visibility в самой таблице)
export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// ChatSettings - для будущей миграции (пока не используется)
export const chatSettings = pgTable('ChatSettings', {
  chatId: uuid('chatId')
    .primaryKey()
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type ChatSettings = InferSelectModel<typeof chatSettings>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-Lumia A.I/blob/main/docs/04-migrate-to-parts.md
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

// Message_v2 - реальная структура БД (parts и attachments в самой таблице)
export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// MessageContent - для будущей миграции (пока не используется)
export const messageContent = pgTable('MessageContent', {
  messageId: uuid('messageId')
    .primaryKey()
    .notNull()
    .references(() => message.id, { onDelete: 'cascade' }),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
});

export type MessageContent = InferSelectModel<typeof messageContent>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://github.com/vercel/ai-Lumia A.I/blob/main/docs/04-migrate-to-parts.md
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

// Vote_v2 разделен на Vote и VoteMetadata
export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const voteMetadata = pgTable('VoteMetadata', {
  chatId: uuid('chatId').notNull(),
  messageId: uuid('messageId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  voteRef: foreignKey({
    columns: [table.chatId, table.messageId],
    foreignColumns: [vote.chatId, vote.messageId],
  }),
}));

export type VoteMetadata = InferSelectModel<typeof voteMetadata>;

// Document - реальная структура БД (content и text/kind в самой таблице)
export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    text: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

// DocumentContent - для будущей миграции (пока не используется)
export const documentContent = pgTable('DocumentContent', {
  documentId: uuid('documentId').notNull(),
  documentCreatedAt: timestamp('documentCreatedAt').notNull(),
  content: text('content'),
  kind: varchar('kind', { enum: ['text', 'code', 'image', 'sheet'] })
    .notNull()
    .default('text'),
}, (table) => ({
  pk: primaryKey({ columns: [table.documentId, table.documentCreatedAt] }),
  documentRef: foreignKey({
    columns: [table.documentId, table.documentCreatedAt],
    foreignColumns: [document.id, document.createdAt],
  }),
}));

export type DocumentContent = InferSelectModel<typeof documentContent>;

// Suggestion - реальная структура БД (все поля в одной таблице)
export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

// SuggestionContent - для будущей миграции (пока не используется)
export const suggestionContent = pgTable('SuggestionContent', {
  suggestionId: uuid('suggestionId')
    .primaryKey()
    .notNull()
    .references(() => suggestion.id, { onDelete: 'cascade' }),
  originalText: text('originalText').notNull(),
  suggestedText: text('suggestedText').notNull(),
  description: text('description'),
  isResolved: boolean('isResolved').notNull().default(false),
});

export type SuggestionContent = InferSelectModel<typeof suggestionContent>;
