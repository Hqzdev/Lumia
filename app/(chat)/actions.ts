'use server';

import { generateText, Message } from 'ai';
import { cookies } from 'next/headers';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';

    export async function saveChatModelAsCookie(model: string) {
      const cookieStore = await cookies();
      cookieStore.set('chat-model', model);
    }



export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  // Извлекаем текст из сообщения
  const getMessageText = (msg: Message): string => {
    if (typeof msg.content === 'string') {
      return msg.content;
    }
    if (Array.isArray(msg.content)) {
      const contentArray = msg.content as Array<{ type: string; text?: string }>;
      const textPart = contentArray.find((part) => part.type === 'text');
      return textPart?.text || '';
    }
    return '';
  };

  const messageText = getMessageText(message);
  
  // Если сообщение пустое, возвращаем дефолтный заголовок
  if (!messageText.trim()) {
    return 'New Chat';
  }

  // Пробуем сгенерировать заголовок через AI, но не блокируем если не получается
  try {
    const result = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
      prompt: messageText,
  });

    if (result.text && result.text.trim()) {
      return result.text.trim();
    }
  } catch (error) {
    // Игнорируем ошибку и используем fallback
    console.warn('AI title generation failed, using text fallback:', error);
  }

  // Fallback: используем первые 60 символов сообщения пользователя
  const title = messageText.slice(0, 60).trim();
  return title || 'New Chat';
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
