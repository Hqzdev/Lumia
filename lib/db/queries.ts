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
  messageDeprecated,
  type MessageDeprecated,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';

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
        // Валидируем и нормализуем сообщения перед сохранением
        const validatedMessages = messages.map((msg) => {
          // Убеждаемся, что parts не null и не undefined
          let parts = msg.parts;
          if (!parts || (Array.isArray(parts) && parts.length === 0)) {
            // Если parts пустой, создаем дефолтный parts
            parts = [{ type: 'text', text: '' }];
          }

          // Убеждаемся, что attachments не null
          const attachments = msg.attachments ?? [];

          return {
            ...msg,
            parts,
            attachments,
          };
        });

        return await db.insert(message).values(validatedMessages);
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
        // Сначала получаем сообщения из Message_v2
        const messagesV2 = await db
          .select()
          .from(message)
          .where(eq(message.chatId, id))
          .orderBy(asc(message.createdAt));

        // Если есть сообщения в Message_v2, возвращаем их
        if (messagesV2.length > 0) {
          return messagesV2;
        }

        // Если нет сообщений в Message_v2, пробуем загрузить из старой таблицы Message
        try {
          const oldMessages = await db
            .select()
            .from(messageDeprecated)
            .where(eq(messageDeprecated.chatId, id))
            .orderBy(asc(messageDeprecated.createdAt));

          // Конвертируем старые сообщения в новый формат
          const convertedMessages: Array<DBMessage> = oldMessages.map(
            (oldMsg) => {
              // Преобразуем content в parts
              let parts: any[] = [];
              if (oldMsg.content) {
                if (typeof oldMsg.content === 'string') {
                  parts = [{ type: 'text', text: oldMsg.content }];
                } else if (Array.isArray(oldMsg.content)) {
                  parts = oldMsg.content;
                } else if (typeof oldMsg.content === 'object') {
                  // Если content - объект, пытаемся извлечь текст
                  const text =
                    (oldMsg.content as any).text ||
                    JSON.stringify(oldMsg.content);
                  parts = [{ type: 'text', text }];
                } else {
                  parts = [{ type: 'text', text: String(oldMsg.content) }];
                }
              } else {
                parts = [{ type: 'text', text: '' }];
              }

              return {
                id: oldMsg.id,
                chatId: oldMsg.chatId,
                role: oldMsg.role,
                parts: parts,
                attachments: [],
                createdAt: oldMsg.createdAt,
              };
            },
          );

          return convertedMessages;
        } catch (oldError) {
          // Если старая таблица не существует или ошибка, просто возвращаем пустой массив
          console.warn(
            'Failed to load old messages, table Message might not exist:',
            oldError,
          );
          return [];
        }
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
      text: kind, // В БД поле называется 'text', а не 'kind'
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

// ============================================
// ДОПОЛНИТЕЛЬНЫЕ CRUD ОПЕРАЦИИ
// ============================================

// User: Полный Update
export async function updateUser({
  userId,
  email,
  password,
  nickname,
}: {
  userId: string;
  email?: string;
  password?: string;
  nickname?: string;
}) {
  try {
    const updateData: Partial<User> = {};
    if (email) updateData.email = email;
    if (password) {
      const salt = genSaltSync(10);
      updateData.password = hashSync(password, salt);
    }
    if (nickname) updateData.nickname = nickname;

    const result = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning();

    if (!result || result.length === 0) {
      throw new Error(`User with id ${userId} not found`);
    }
    return result[0];
  } catch (error) {
    console.error('Failed to update user in database', error);
    throw error;
  }
}

// User: Delete
export async function deleteUserById({ id }: { id: string }) {
  try {
    // Получаем все чаты пользователя
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, id));

    const chatIds = userChats.map((c) => c.id);

    // Удаляем связанные данные
    if (chatIds.length > 0) {
      await db.delete(vote).where(inArray(vote.chatId, chatIds));
      await db.delete(message).where(inArray(message.chatId, chatIds));
    }
    await db.delete(chat).where(eq(chat.userId, id));
    await db.delete(suggestion).where(eq(suggestion.userId, id));
    await db.delete(document).where(eq(document.userId, id));

    // Затем удаляем пользователя
    return await db.delete(user).where(eq(user.id, id));
  } catch (error) {
    console.error('Failed to delete user from database', error);
    throw error;
  }
}

// User: GetAll
export async function getAllUsers() {
  try {
    return await db.select().from(user).orderBy(asc(user.email));
  } catch (error) {
    console.error('Failed to get all users from database', error);
    throw error;
  }
}

// Chat: Полный Update
export async function updateChat({
  chatId,
  title,
}: {
  chatId: string;
  title?: string;
}) {
  try {
    const updateData: { title?: string } = {};
    if (title) updateData.title = title;

    const result = await db
      .update(chat)
      .set(updateData)
      .where(eq(chat.id, chatId))
      .returning();

    if (!result || result.length === 0) {
      throw new Error(`Chat with id ${chatId} not found`);
    }
    return result[0];
  } catch (error) {
    console.error('Failed to update chat in database', error);
    throw error;
  }
}

// Message: Update
export async function updateMessage({
  messageId,
  parts,
  attachments,
}: {
  messageId: string;
  parts?: any;
  attachments?: any;
}) {
  try {
    const updateData: { parts?: any; attachments?: any } = {};
    if (parts) updateData.parts = parts;
    if (attachments) updateData.attachments = attachments;

    const result = await db
      .update(message)
      .set(updateData)
      .where(eq(message.id, messageId))
      .returning();

    if (!result || result.length === 0) {
      throw new Error(`Message with id ${messageId} not found`);
    }
    return result[0];
  } catch (error) {
    console.error('Failed to update message in database', error);
    throw error;
  }
}

// Message: Delete по ID
export async function deleteMessageById({ id }: { id: string }) {
  try {
    // Удаляем связанные голоса
    await db.delete(vote).where(eq(vote.messageId, id));
    // Удаляем сообщение
    return await db.delete(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to delete message from database', error);
    throw error;
  }
}

// Vote: Delete
export async function deleteVote({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}) {
  try {
    return await db
      .delete(vote)
      .where(and(eq(vote.chatId, chatId), eq(vote.messageId, messageId)));
  } catch (error) {
    console.error('Failed to delete vote from database', error);
    throw error;
  }
}

// Document: Update
export async function updateDocument({
  documentId,
  documentCreatedAt,
  title,
  content,
  kind,
}: {
  documentId: string;
  documentCreatedAt: Date;
  title?: string;
  content?: string;
  kind?: ArtifactKind;
}) {
  try {
    const updateData: {
      title?: string;
      content?: string;
      text?: ArtifactKind;
    } = {};
    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (kind) updateData.text = kind; // В БД поле называется 'text', а не 'kind'

    const result = await db
      .update(document)
      .set(updateData)
      .where(
        and(
          eq(document.id, documentId),
          eq(document.createdAt, documentCreatedAt),
        ),
      )
      .returning();

    if (!result || result.length === 0) {
      throw new Error(
        `Document with id ${documentId} and createdAt ${documentCreatedAt} not found`,
      );
    }
    return result[0];
  } catch (error) {
    console.error('Failed to update document in database', error);
    throw error;
  }
}

// Document: Delete по ID
export async function deleteDocumentById({
  id,
  createdAt,
}: {
  id: string;
  createdAt: Date;
}) {
  try {
    // Удаляем связанные предложения
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          eq(suggestion.documentCreatedAt, createdAt),
        ),
      );
    // Удаляем документ
    return await db
      .delete(document)
      .where(and(eq(document.id, id), eq(document.createdAt, createdAt)));
  } catch (error) {
    console.error('Failed to delete document from database', error);
    throw error;
  }
}

// Suggestion: Update
export async function updateSuggestion({
  suggestionId,
  originalText,
  suggestedText,
  description,
  isResolved,
}: {
  suggestionId: string;
  originalText?: string;
  suggestedText?: string;
  description?: string;
  isResolved?: boolean;
}) {
  try {
    const updateData: Partial<Suggestion> = {};
    if (originalText !== undefined) updateData.originalText = originalText;
    if (suggestedText !== undefined) updateData.suggestedText = suggestedText;
    if (description !== undefined) updateData.description = description;
    if (isResolved !== undefined) updateData.isResolved = isResolved;

    const result = await db
      .update(suggestion)
      .set(updateData)
      .where(eq(suggestion.id, suggestionId))
      .returning();

    if (!result || result.length === 0) {
      throw new Error(`Suggestion with id ${suggestionId} not found`);
    }
    return result[0];
  } catch (error) {
    console.error('Failed to update suggestion in database', error);
    throw error;
  }
}

// Suggestion: Delete
export async function deleteSuggestionById({ id }: { id: string }) {
  try {
    return await db.delete(suggestion).where(eq(suggestion.id, id));
  } catch (error) {
    console.error('Failed to delete suggestion from database', error);
    throw error;
  }
}
