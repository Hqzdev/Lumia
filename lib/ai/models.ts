export const DEFAULT_CHAT_MODEL: string = 'chat-model';

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Lumia V1',
    description: 'Great for most tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Lumia V1 Max',
    description: 'Enhanced performance for writing and idea exploration',
  },
];
