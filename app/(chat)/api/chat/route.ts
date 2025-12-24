import type { UIMessage } from 'ai';
import {
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      let title: string;
      try {
        title = await generateTitleFromUserMessage({
        message: userMessage,
      });
      } catch (error) {
        console.error('Failed to generate title, using fallback:', error);
        // Fallback: используем первые 60 символов сообщения
        const messageContent = typeof userMessage.content === 'string' 
          ? userMessage.content 
          : Array.isArray(userMessage.content)
          ? (userMessage.content as Array<{ type: string; text?: string }>).find(part => part.type === 'text')?.text || 'New Chat'
          : 'New Chat';
        title = messageContent.slice(0, 60).trim() || 'New Chat';
      }

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // Преобразуем content в parts, если parts отсутствует
    let userParts = userMessage.parts;
    if (!userParts || userParts.length === 0) {
      // Если parts нет, создаем из content
      if (typeof userMessage.content === 'string') {
        userParts = [{ type: 'text', text: userMessage.content }];
      } else if (Array.isArray(userMessage.content)) {
        userParts = userMessage.content;
      } else {
        // Fallback: пустой текст
        userParts = [{ type: 'text', text: '' }];
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userParts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    return createDataStreamResponse({
      execute: async (dataStream) => {
        try {
        const sysPrompt = systemPrompt({ selectedChatModel });
        const system = typeof sysPrompt === 'function' ? sysPrompt() : sysPrompt;
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system,
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
            onFinish: async ({ response, finishReason }) => {
            // Если ответ не завершен успешно, не сохраняем сообщение

            if (finishReason === 'error' || finishReason === 'length' || finishReason === 'content-filter') {
              console.warn('AI generation finished with non-success reason:', finishReason);
              return;
            }

            if (session.user?.id) {
              try {
                // Фильтруем только успешные assistant сообщения
                const assistantMessages = response.messages.filter(
                  (message) => message.role === 'assistant',
                );

                if (assistantMessages.length === 0) {
                  console.warn('No assistant messages in response');
                  return;
                }

                const assistantId = getTrailingMessageId({
                  messages: assistantMessages,
                });

                if (!assistantId) {
                  console.warn('No assistant message ID found');
                  return;
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                if (!assistantMessage) {
                  console.warn('Failed to extract assistant message');
                  return;
                }

                // Преобразуем content в parts, если parts отсутствует
                let parts = assistantMessage.parts;
                if (!parts || (Array.isArray(parts) && parts.length === 0)) {
                  // Если parts нет, создаем из content
                  if (typeof assistantMessage.content === 'string') {
                    parts = [{ type: 'text', text: assistantMessage.content }];
                  } else if (Array.isArray(assistantMessage.content)) {
                    parts = assistantMessage.content;
                  } else {
                    // Fallback: пустой текст (но это не должно происходить)
                    console.warn('Assistant message has no content or parts, using empty text');
                    parts = [{ type: 'text', text: 'Ошибка генерации ответа' }];
                  }
                }

                // Убеждаемся, что parts не null и не undefined
                if (!parts || (Array.isArray(parts) && parts.length === 0)) {
                  console.warn('Parts is empty after conversion, skipping save');
                  return;
                }

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role || 'assistant',
                      parts: parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (error) {
                console.error('Failed to save assistant message:', error);
                // Не выбрасываем ошибку, чтобы не сломать поток
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
        } catch (streamError) {
          console.error('Error in streamText execution:', streamError);
          // Отправляем сообщение об ошибке в поток
          dataStream.writeData({
            type: 'text-delta',
            textDelta: '\n\nОшибка: Модель AI временно недоступна. Пожалуйста, попробуйте позже.',
          });
          dataStream.writeData({
            type: 'finish',
            finishReason: 'error',
          });
        }
      },
      onError: (error) => {
        console.error('Error in data stream:', error);
        
        // Логируем детали ошибки для отладки
        if (error instanceof Error) {
          const errorDetails: any = error as any;
          console.error('Error details:', {
            message: error.message,
            statusCode: errorDetails.statusCode,
            responseBody: errorDetails.responseBody,
            url: errorDetails.url,
          });
          
          // Если это ошибка модели (404), возвращаем понятное сообщение
          if (errorDetails.statusCode === 404) {
            const responseBody = errorDetails.responseBody;
            if (typeof responseBody === 'string') {
              try {
                const parsed = JSON.parse(responseBody);
                if (parsed.error?.message) {
                  console.error('Model error message:', parsed.error.message);
                }
              } catch (e) {
                // Игнорируем ошибку парсинга
              }
            }
            return 'Модель AI не найдена или недоступна. Проверьте конфигурацию модели в lib/ai/providers.ts и доступность модели в вашем аккаунте Fireworks AI.';
          }
        }
        
        return 'Произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.';
      },
    });
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    return new Response(
      `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
