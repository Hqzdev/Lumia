import { customProvider } from 'ai';
import { fireworks } from '@ai-sdk/fireworks';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Просто укажите FIREWORKS_API_KEY=sk-... в .env.local
// SDK автоматически подхватит ключ из переменных окружения

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
        'chat-model': fireworks('accounts/fireworks/models/deepseek-r1'),
        'chat-model-reasoning': fireworks('accounts/fireworks/models/deepseek-r1'),
        'title-model': fireworks('accounts/fireworks/models/deepseek-r1'),
        'artifact-model': fireworks('accounts/fireworks/models/deepseek-r1'),
      },
      imageModels: {},
    });

// .env.local:
// FIREWORKS_API_KEY=sk-...
