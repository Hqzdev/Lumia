import { customProvider } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Baseten API конфигурация
// Укажите BASETEN_API_KEY в .env.local
// SDK автоматически подхватит ключ из переменных окружения

// Создаем провайдер OpenAI с кастомным baseURL для Baseten
// createOpenAI возвращает провайдер, который можно использовать как функцию для создания моделей
const basetenProvider = createOpenAI({
  apiKey: process.env.BASETEN_API_KEY,
  baseURL: 'https://inference.baseten.co/v1',
});

// Модель для использования: deepseek-ai/DeepSeek-V3.2
const BASETEN_MODEL = 'deepseek-ai/DeepSeek-V3.2';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Используем Baseten API с моделью DeepSeek-V3.2
        // Провайдер используется как функция с именем модели
        'chat-model': basetenProvider(BASETEN_MODEL) as any,
        'chat-model-reasoning': basetenProvider(BASETEN_MODEL) as any, // Используем ту же модель для reasoning
        'title-model': basetenProvider(BASETEN_MODEL) as any,
        'artifact-model': basetenProvider(BASETEN_MODEL) as any,
      },
      imageModels: {},
    });

// .env.local:
// BASETEN_API_KEY=t0ykWlOP.tpgRtdzZg2xMa5iO8jV7IwYgtnd9pEW8
