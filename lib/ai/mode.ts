export const DEFAULT_CHAT_MODE: string = 'chat-mode';

interface ChatMode {
  id: string;
  name: string;
  description: string;
}

export const chatModes: Array<ChatMode> = [
    {
      id: 'creative-mode',
      name: 'Creative',
      description: 'Ideal for storytelling, writing, and idea generation',
    },
    {
      id: 'math-mode',
      name: 'Math',
      description: 'Optimized for calculations, equations, and analytical tasks',
    },
    {
      id: 'logic-mode',
      name: 'Logic',
      description: 'Best for structured reasoning, problem-solving, and deduction',
    },
    {
      id: 'visual-mode',
      name: 'Vision',
      description: 'Specialized in image tasks and visual understanding',
    },
    {
      id: 'code-mode',
      name: 'Code',
      description: 'Focused on software development, debugging, and code generation',
    },
    {
      id: 'science-mode',
      name: 'Science',
      description: 'Designed for scientific topics, data analysis, and technical research',
    },
  ];
  