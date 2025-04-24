'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo, useMemo } from 'react';
import {
  Lightbulb,
  BookOpen,
  PenLine,
  FileText,
  Flame,
  Brain,
  Globe,
  BotMessageSquare,
  Sparkles,
} from 'lucide-react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

export const generalSuggestedActions = [
  {
    title: 'Explain the concept',
    label: 'of closures in JavaScript',
    icon: <BookOpen size={18} />,
    action: 'Explain the concept of closures in JavaScript with examples.',
  },
  {
    title: 'Generate an idea',
    label: 'for a startup app',
    icon: <Lightbulb size={18} />,
    action: 'Generate a unique idea for a startup mobile app in the health-tech space.',
  },
  {
    title: 'Write a poem',
    label: 'about the ocean at night',
    icon: <PenLine size={18} />,
    action: 'Write a short poem about the ocean at night in a calm, mysterious tone.',
  },
  {
    title: 'Summarize this article',
    label: 'on climate change',
    icon: <FileText size={18} />,
    action: 'Summarize the key points of a typical article about climate change in under 100 words.',
  },
  {
    title: 'List pros and cons',
    label: 'of remote work',
    icon: <Flame size={18} />,
    action: 'List the pros and cons of working remotely in the tech industry.',
  },
  {
    title: 'Give a quick tip',
    label: 'to stay productive',
    icon: <Brain size={18} />,
    action: 'Give a quick and actionable tip to stay productive while working from home.',
  },
  {
    title: 'Describe a sci-fi world',
    label: 'in the year 3000',
    icon: <Globe size={18} />,
    action: 'Describe a detailed sci-fi world set in the year 3000.',
  },
  {
    title: 'Explain a meme',
    label: "like you're 5",
    icon: <BotMessageSquare size={18} />,
    action: 'Explain a popular internet meme as if you were talking to a 5-year-old.',
  },
  {
    title: 'Make a daily affirmation',
    label: 'for self-confidence',
    icon: <Sparkles size={18} />,
    action: 'Create a short daily affirmation focused on boosting self-confidence.',
  },
  {
    title: 'Write a short story',
    label: 'about a robot and a cat',
    icon: <PenLine size={18} />,
    action: 'Write a short story about a robot and a cat who become friends.',
  },
  {
    title: 'Translate this text',
    label: 'to French',
    icon: <Globe size={18} />,
    action: 'Translate the following text to French: ...',
  },
];

export const searchSuggestedActions = [
  {
    title: 'YouTube Shorts',
    label: '',
    icon: <Sparkles size={18} />,
    action: 'YouTube Shorts',
  },
  {
    title: 'Sports News',
    label: '',
    icon: <Flame size={18} />,
    action: 'Sports News',
  },
  {
    title: 'The Pope Has Died',
    label: '',
    icon: <BookOpen size={18} />,
    action: 'The Pope Has Died',
  },
  {
    title: 'World & Russia News',
    label: '',
    icon: <Globe size={18} />,
    action: 'World & Russia News',
  },
  {
    title: 'Weather in Moscow',
    label: '',
    icon: <Sparkles size={18} />,
    action: 'Weather in Moscow',
  },
  {
    title: 'USD Exchange Rate',
    label: '',
    icon: <Brain size={18} />,
    action: 'USD Exchange Rate',
  },
  {
    title: 'Train Schedule',
    label: '',
    icon: <FileText size={18} />,
    action: 'Train Schedule',
  },
  {
    title: "Today's Horoscope",
    label: '',
    icon: <Lightbulb size={18} />,
    action: "Today's Horoscope",
  },
];


const iconBgColors = [
  'text-yellow-700',
  'text-blue-700',
  'ext-green-700',
  'text-pink-700',
  'text-orange-700',
  'text-purple-700',
  'text-cyan-700',
  'text-rose-700',
  'text-lime-700',
];

function PureSuggestedActions({ chatId, append, mode = 'general' }: SuggestedActionsProps & { mode?: 'general' | 'search' }) {
  const actions = mode === 'search' ? searchSuggestedActions : generalSuggestedActions;
  const suggestedActions = useMemo(() => {
    const shuffled = [...actions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [actions]);

  return (
    <div
      data-testid="suggested-actions"
      className="hidden sm:grid sm:grid-cols-3 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);
              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border border-gray-200 rounded-3xl text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-3.5 text-sm flex flex-row items-center justify-start gap-3 w-full h-50px"
          >
            <div className={`rounded-full p-2 flex items-center justify-center ${iconBgColors[index % iconBgColors.length]}`}>
              {suggestedAction.icon}
            </div>
            <div className="flex flex-col items-start justify-center w-full">
              <span className="font-medium text-left">{suggestedAction.title}</span>
              {/* If you want to show the label, uncomment below: */}
              {/* <span className="text-muted-foreground text-left">{suggestedAction.label}</span> */}
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
