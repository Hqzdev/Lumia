import 'server-only';

// Import error handler to catch unhandled rejections
import './error-handler';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  // userProfile,
  // type UserProfile,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// Helper function to create database connection with retry
function createDbConnection() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }

  return postgres(process.env.POSTGRES_URL, {
    connect_timeout: 5, // 5 seconds connection timeout для быстрого ответа
    idle_timeout: 30, // 30 seconds idle timeout
    max_lifetime: 60 * 30, // 30 minutes max connection lifetime
    max: 10, // Уменьшено с 20 до 10 для меньшего потребления ресурсов
    connection: {
      application_name: 'lumia-app',
    },
    fetch_types: false, // Отключаем получение типов для ускорения
    prepare: false, // Отключаем prepared statements для лучшей совместимости
    onnotice: () => {}, // Игнорируем notices
    transform: {
      undefined: null, // Преобразуем undefined в null
    },
  });
}

const client = createDbConnection();
const db = drizzle(client);

// Helper function for retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2, // Уменьшено с 3 до 2 для ускорения
  delay = 300, // Уменьшено с 1000 до 300ms для быстрого ответа
  operationName = 'database operation',
): Promise<T> {
  let lastError: Error | unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Проверяем код ошибки и сообщение
      const isTimeoutError =
        (error &&
          typeof error === 'object' &&
          'code' in error &&
          (error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNRESET' ||
            error.code === 'ENOTFOUND')) ||
        (error instanceof Error &&
          (error.message.includes('ETIMEDOUT') ||
            error.message.includes('timeout') ||
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('ECONNRESET') ||
            error.message.includes('read ETIMEDOUT')));

      // Если это не таймаут или ошибка подключения, не повторяем
      if (!isTimeoutError) {
        console.error(`[${operationName}] Non-retryable error:`, error);
        throw error;
      }

      console.warn(
        `[${operationName}] Retry attempt ${i + 1}/${maxRetries} after timeout error:`,
        error instanceof Error ? error.message : String(error),
      );

      // Если это последняя попытка, выбрасываем ошибку
      if (i === maxRetries - 1) {
        console.error(`[${operationName}] All retry attempts failed`);
        throw error;
      }

      // Ждем перед повтором (exponential backoff, но быстрее)
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }

  throw lastError;
}

export async function getUserByEmail(email: string): Promise<Array<User>> {
  try {
    // Прямой запрос без retry для максимальной скорости
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database', error);
    throw error;
  }
}

export async function getUserByNickname(
  nickname: string,
): Promise<Array<User>> {
  try {
    // Прямой запрос без retry для максимальной скорости
    return await db.select().from(user).where(eq(user.nickname, nickname));
  } catch (error) {
    console.error('Failed to get user from database', error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.id, userId));
  } catch (error) {
    console.error('Failed to get user by id from database', error);
    throw error;
  }
}

export async function createUser(
  email: string,
  password: string,
  nickname: string,
) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({
      email,
      password: hash,
      nickname,
      subscription: 'free',
    });
  } catch (error) {
    console.error('Failed to create user in database', error);
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await withRetry(
      async () => {
        return await db.insert(chat).values({
          id,
          createdAt: new Date(),
          userId,
          title,
        });
      },
      3,
      1000,
      `saveChat(${id})`,
    );
  } catch (error) {
    console.error('Failed to save chat in database', error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await withRetry(
      async () => {
        return await db
          .select()
          .from(chat)
          .where(eq(chat.userId, id))
          .orderBy(desc(chat.createdAt));
      },
      3,
      1000,
      `getChatsByUserId(${id})`,
    );
  } catch (error) {
    console.error('Failed to get chats by user from database', error);
    // Возвращаем пустой массив вместо выброса ошибки для graceful degradation
    return [];
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await withRetry(
      async () => {
        const [selectedChat] = await db
          .select()
          .from(chat)
          .where(eq(chat.id, id));
        return selectedChat;
      },
      3,
      1000,
      `getChatById(${id})`,
    );
  } catch (error) {
    console.error('Failed to get chat by id from database', error);
    // Возвращаем undefined вместо выброса ошибки
    return undefined;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await withRetry(
      async () => {
        return await db.insert(message).values(messages);
      },
      3,
      1000,
      `saveMessages(${messages.length} messages)`,
    );
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await withRetry(
      async () => {
        return await db
          .select()
          .from(message)
          .where(eq(message.chatId, id))
          .orderBy(asc(message.createdAt));
      },
      3,
      1000,
      `getMessagesByChatId(${id})`,
    );
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    // Возвращаем пустой массив вместо выброса ошибки
    return [];
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    return await withRetry(
      async () => {
        const [existingVote] = await db
          .select()
          .from(vote)
          .where(and(eq(vote.messageId, messageId)));

        if (existingVote) {
          return await db
            .update(vote)
            .set({ isUpvoted: type === 'up' })
            .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
        }
        return await db.insert(vote).values({
          chatId,
          messageId,
          isUpvoted: type === 'up',
        });
      },
      3,
      1000,
      `voteMessage(${messageId})`,
    );
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await withRetry(
      async () => {
        return await db.select().from(vote).where(eq(vote.chatId, id));
      },
      3,
      1000,
      `getVotesByChatId(${id})`,
    );
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    // Возвращаем пустой массив для graceful degradation
    return [];
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

export async function updateUserSubscription({
  userId,
  subscription,
}: { userId: string; subscription: 'free' | 'premium' | 'team' }) {
  try {
    console.log('Updating subscription for user:', userId, 'to:', subscription);
    return await withRetry(
      async () => {
        const result = await db
          .update(user)
          .set({ subscription })
          .where(eq(user.id, userId))
          .returning();

        console.log('Update result:', result);

        if (!result || result.length === 0) {
          throw new Error(`User with id ${userId} not found`);
        }

        return result;
      },
      3,
      1000,
      `updateUserSubscription(${userId})`,
    );
  } catch (error) {
    console.error('Failed to update user subscription in database:', error);
    throw error;
  }
}

export async function getUserCustomization(userId: string) {
  try {
    const [result] = await db
      .select({ customization: user.customization })
      .from(user)
      .where(eq(user.id, userId));
    return result?.customization ?? null;
  } catch (error) {
    console.error('Failed to get user customization from database', error);
    throw error;
  }
}

export async function updateUserCustomization({
  userId,
  customization,
}: { userId: string; customization: any }) {
  try {
    const result = await db
      .update(user)
      .set({ customization })
      .where(eq(user.id, userId))
      .returning();
    if (!result || result.length === 0) {
      throw new Error(`User with id ${userId} not found`);
    }
    return result[0];
  } catch (error) {
    console.error('Failed to update user customization in database', error);
    throw error;
  }
}
