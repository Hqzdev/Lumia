import React from 'react';
import type { Attachment, Message } from 'ai';
import { useRef, useEffect, useState, useCallback, memo } from 'react';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useArtifactSelector, useArtifact } from '@/hooks/use-artifact';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { useOS } from '@/hooks/use-os';
import { HotkeyBadge } from './hotkey-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { StopIcon } from './icons';
import {
  ArrowUp,
  ChartNoAxesCombined,
  Paperclip,
  Search,
  Lightbulb,
  PlusIcon,
  Paintbrush,
  SlidersHorizontal,
  Telescope,
  Sparkles,
  Image as ImageIcon,
  AudioLines,
  Palette,
  Camera,
  Film,
  User,
  Brush,
  Smile,
  Sun,
  Zap,
} from 'lucide-react';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useSidebar } from '@/components/ui/sidebar';
import { regularPrompt, deepSearchPrompt } from '@/lib/ai/prompts';
import { SearchResults } from './search-results';
import { SearchResultsImageSection } from './search-results-image';
import { VideoSearchResults } from './video-search-results';
import { Markdown } from './markdown';
import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

// Стили для генерации изображений
const IMAGE_STYLES = [
  {
    key: 'cyberpunk',
    label: 'Cyberpunk',
    prompt:
      'A cyberpunk painting, neon lights, futuristic city, high-tech atmosphere, glowing accents, dark tones',
    icon: <Zap className="size-14 mx-auto" />,
  },
  {
    key: 'anime',
    label: 'Anime',
    prompt:
      'A painting in anime style, vibrant colors, cel shading, expressive characters, scenic background, clean outlines',
    icon: <Smile className="size-14 mx-auto" />,
  },
  {
    key: 'dramatic',
    label: 'Dramatic headshot',
    prompt:
      'A dramatic portrait painting, cinematic lighting, close-up composition, intense expression, rich contrast',
    icon: <User className="size-14 mx-auto" />,
  },
  {
    key: 'coloring',
    label: 'Coloring book',
    prompt:
      'A black and white line drawing, simplified outlines, no color, made for coloring books, clean and clear shapes',
    icon: <Brush className="size-14 mx-auto" />,
  },
  {
    key: 'photoshoot',
    label: 'Photoshoot',
    prompt:
      'A hyper-realistic studio painting, professional lighting, detailed textures, polished and photo-like quality',
    icon: <Camera className="size-14 mx-auto" />,
  },
  {
    key: 'retrocartoon',
    label: 'Retro cartoon',
    prompt:
      'A painting in retro cartoon style, vintage aesthetics, flat colors, bold outlines, nostalgic and playful',
    icon: <Film className="size-14 mx-auto" />,
  },
  {
    key: 'glamour-80s',
    label: 'Glamour 80s',
    prompt:
      'An 80s glamour painting, neon glow, soft-focus lighting, retro fashion vibes, pastel and metallic tones',
    icon: <Sparkles className="size-14 mx-auto" />,
  },
  {
    key: 'art-nouveau',
    label: 'Art-Nouveau',
    prompt:
      'A painting in Art Nouveau style, decorative floral elements, flowing lines, organic forms, muted earthy tones',
    icon: <Palette className="size-14 mx-auto" />,
  },
  {
    key: 'synthwave',
    label: 'Synthwave',
    prompt:
      'A synthwave-inspired painting, neon pinks and purples, grid landscapes, retro-futuristic atmosphere, 80s vibe',
    icon: <Sun className="size-14 mx-auto" />,
  },
];

function ChatSearchDialog({
  open,
  onOpenChange,
  user,
}: { open: boolean; onOpenChange: (v: boolean) => void; user: any }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: chats, isLoading } = useSWR<
    Array<{ id: string; title: string }>
  >(user ? '/api/history' : null);

  const filtered = useMemo(() => {
    if (!chats) return [];
    if (!query.trim()) return chats;
    return chats.filter((chat) =>
      chat.title.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [chats, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Chats</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search by chat title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-4"
        />
        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No chats found</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/chat/${chat.id}`);
                    }}
                  >
                    {chat.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- PROMPT ARRAYS FOR MODES ---
const PROMPTS = {
  web: [
    'What is the latest news in technology?',
    'Find me a recipe for a healthy breakfast',
    "What's the weather like in Tokyo?",
    'How do I start learning Python?',
    'Best places to visit in Europe',
    'Explain quantum computing in simple terms',
    'What are the top movies this year?',
    'How to improve productivity at work?',
    'What is the stock price of Apple?',
    'Tips for remote work',
    'What is AI and how does it work?',
    'How to cook pasta al dente?',
    'What are the symptoms of flu?',
    'How to meditate effectively?',
    'What is the capital of Australia?',
    'How to save money on groceries?',
    'What is the best smartphone in 2024?',
    'How to learn a new language fast?',
    'What are the benefits of yoga?',
    'How to write a resume?',
  ],
  deep: [
    'Analyze the impact of social media on society',
    'Research the history of electric vehicles',
    'Compare renewable energy sources',
    'What are the causes of climate change?',
    'Explore the future of artificial intelligence',
    'Investigate the effects of sleep deprivation',
    'Study the evolution of the internet',
    'What are the challenges of space travel?',
    'Examine the psychology of motivation',
    'Research the benefits of mindfulness',
    'How does blockchain technology work?',
    'What are the risks of genetic engineering?',
    'Explore the history of jazz music',
    'Analyze the global economy trends',
    'What is quantum entanglement?',
    'Study the migration patterns of birds',
    'Investigate the causes of inflation',
    'What are the effects of pollution on health?',
    'Research the origins of language',
    'Examine the role of women in science',
  ],
  image: [
    'A futuristic cityscape at sunset',
    'A cat astronaut floating in space',
    'A serene mountain lake in autumn',
    'A cyberpunk street scene at night',
    'A magical forest with glowing plants',
    'A portrait of a robot artist',
    'A cozy cabin in a snowy landscape',
    'A surreal dreamscape with floating islands',
    'A detailed steampunk airship',
    'A vibrant underwater coral reef',
    'A fantasy castle on a hill',
    'A retro 80s neon city',
    'A group of animals having a tea party',
    'A dragon flying over mountains',
    'A peaceful zen garden',
    'A bustling medieval marketplace',
    'A close-up of a colorful butterfly',
    'A futuristic sports car',
    'A mystical portal in the woods',
    'A child;s drawing of their family',
  ],
  canvas: [
    'Draw a tree with autumn leaves',
    'Sketch a smiling sun',
    'Draw a house with a garden',
    'Create a pattern with circles and lines',
    'Draw a cat playing with a ball',
    'Sketch a mountain landscape',
    'Draw a rocket ship blasting off',
    'Create a doodle of your favorite food',
    'Draw a flower bouquet',
    'Sketch a rainy day scene',
    'Draw a fantasy creature',
    'Create a geometric abstract art',
    'Draw a city skyline',
    'Sketch a person riding a bicycle',
    'Draw a night sky with stars',
    'Create a mandala pattern',
    'Draw a picnic scene',
    'Sketch a dog chasing its tail',
    'Draw a magical forest',
    'Create a comic strip panel',
  ],
  think: [
    'Explain the meaning of life',
    'What are your goals for this year?',
    'Describe your perfect day',
    'What inspires you the most?',
    'Share a childhood memory',
    'What is your biggest dream?',
    'Describe a challenge you overcame',
    'What makes you happy?',
    'Share your favorite quote',
    'What is your favorite book and why?',
    'Describe a place you want to visit',
    'What is your favorite hobby?',
    'Share a lesson you learned recently',
    'What is your favorite movie?',
    'Describe your morning routine',
    'What is your favorite food?',
    'Share a fun fact about yourself',
    'What is your favorite season?',
    'Describe your ideal weekend',
    'What motivates you to succeed?',
  ],
};

function getRandomPrompts(arr: string[], n: number) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function SuggestedPrompts({
  mode,
  input,
  onSelect,
}: {
  mode: 'web' | 'deep' | 'image' | 'canvas' | 'think' | null;
  input: string;
  onSelect: (prompt: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (mode && !input) {
      setSuggestions(getRandomPrompts(PROMPTS[mode], 4));
      setLoading(false);
    } else if (input.length > 0) {
      setLoading(true);
      fetch(`/api/suggest-prompts?input=${encodeURIComponent(input)}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data.prompts || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setSuggestions([]);
      setLoading(false);
    }
  }, [mode, input]);

  if (input.length > 0 && loading) {
    return <div className="text-gray-400 px-4 py-2">Ищем подсказки…</div>;
  }
  if (input.length > 0 && !loading && suggestions.length === 0) {
    return <div className="text-gray-400 px-4 py-2">Нет подсказок</div>;
  }
  if (suggestions.length === 0) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="flex flex-col gap-2 mb-2"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {suggestions.map((prompt, i) => (
          <React.Fragment key={prompt}>
            <button
              type="button"
              className="group text-left text-gray-700 hover:bg-gray-100 border-none px-4 py-2 cursor-pointer text-md transition-colors rounded-xl w-full"
              onClick={() => onSelect(prompt)}
              style={{
                marginBottom:
                  i !== suggestions.length - 1 ? '0.5rem' : undefined,
              }}
            >
              {/* Иконка только для web search */}
              {mode === 'web' && (
                <span className="inline-flex items-center mr-2 align-middle">
                  <ChartNoAxesCombined className="size-5" />
                </span>
              )}
              {prompt}
            </button>
            {i !== suggestions.length - 1 && (
              <div className="h-0.5 bg-gray-100 -mx-2 group-hover:opacity-0 transition-opacity duration-150" />
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  isSearchMode,
  setIsSearchMode,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
  isSearchMode: boolean;
  setIsSearchMode: Dispatch<SetStateAction<boolean>>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const { setArtifact } = useArtifact();
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isMenuSelected, setIsMenuSelected] = useState(false);
  const { open, openMobile } = useSidebar();
  const [isJustifyMode, setIsJustifyMode] = useState(false);
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false);
  const [isCreateImageMode, setIsCreateImageMode] = useState(false);
  const [isCanvasMode, setIsCanvasMode] = useState(false);
  const [isThinkLongerMode, setIsThinkLongerMode] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [customization, setCustomization] = useState<any>(null);
  const [isInstrumentsOpen, setIsInstrumentsOpen] = useState(false);
  const [isStylePopoverOpen, setIsStylePopoverOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const hasUserMessage = useMemo(
    () => messages.some((m) => m.role === 'user'),
    [messages],
  );
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState<any>(null);
  const [webSearchLoading, setWebSearchLoading] = useState(false);
  const os = useOS();

  // Hotkey: Focus on input (Cmd/Ctrl+L)
  useHotkeys(
    { key: 'l', meta: true },
    (e) => {
      e.preventDefault();
      textareaRef.current?.focus();
    },
    { os }
  );

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  useEffect(() => {
    if (userId) {
      fetch(`/api/user-profile?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setCustomization(data.customization || null);
        })
        .catch((err) => {
          console.error('[MultimodalInput] Error fetching customization:', err);
        });
    }
  }, [userId]);

  useEffect(() => {
    adjustHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Переключение модели происходит при отправке сообщения, а не при активации режима

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setInput(value);
    if (value.startsWith('/')) {
      setIsCommandMenuOpen(true);
    } else {
      setIsCommandMenuOpen(false);
    }
    setIsMenuSelected(false);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(async () => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // Переключаем модель перед отправкой сообщения, если включен Think longer mode
    if (isThinkLongerMode) {
      await saveChatModelAsCookie('chat-model-reasoning');
    } else {
      await saveChatModelAsCookie(DEFAULT_CHAT_MODEL);
    }

    const userPrompt = input;
    let systemPrompt = undefined;
    // Обычный режим
    if (isJustifyMode) {
      setWebSearchLoading(true);
      setWebSearchResults(null);
      try {
        const res = await fetch('/api/websearch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userPrompt }),
        });
        const data = await res.json();
        setWebSearchResults(data);
      } catch (e) {
        toast.error('Ошибка поиска в интернете');
      } finally {
        setWebSearchLoading(false);
      }
      setAttachments([]);
      setLocalStorageInput('');
      setInput('');
      resetHeight();
      if (width && width > 768) {
        textareaRef.current?.focus();
      }
      return;
    } else if (isDeepSearchMode) {
      systemPrompt = deepSearchPrompt;
    } else {
      systemPrompt = regularPrompt(customization);
    }
    if (systemPrompt) {
      console.log('systemPrompt для ИИ:', systemPrompt);
    }
    append(
      { role: 'user', content: userPrompt },
      {
        experimental_attachments: attachments,
      },
    );
    setAttachments([]);
    setLocalStorageInput('');
    setInput('');
    resetHeight();
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
    // Лог финального сообщения
    console.log('Отправлен в ИИ (только пользовательский текст):', userPrompt);
  }, [
    attachments,
    append,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    input,
    isJustifyMode,
    isDeepSearchMode,
    isThinkLongerMode,
    setInput,
    customization,
  ]);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments
          .filter((a) => a?.url)
          .filter((a) => typeof a?.name === 'string')
          .map((a) => a as Attachment);

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile],
  );

  // Drag & drop overlay logic
  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDraggingFile(true);
      }
    };
    const onDragLeave = (e: DragEvent) => {
      if (
        e.relatedTarget == null ||
        !(e.relatedTarget as HTMLElement)?.closest('body')
      ) {
        setIsDraggingFile(false);
      }
    };
    const onDrop = (e: DragEvent) => {
      setIsDraggingFile(false);
    };
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
      }
    };
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    window.addEventListener('dragover', onDragOver);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('dragover', onDragOver);
    };
  }, []);

  // Handle file drop
  const handleOverlayDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingFile(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length > 0) {
        setUploadQueue(files.map((file) => file.name));
        Promise.all(files.map(uploadFile)).then((uploadedAttachments) => {
          const successfullyUploadedAttachments: Attachment[] =
            uploadedAttachments
              .filter((a) => !!a && typeof a.url === 'string')
              .map((a) => a as Attachment);
          setAttachments((current) => [
            ...current,
            ...successfullyUploadedAttachments,
          ]);
        });
      }
    },
    [setAttachments, uploadFile],
  );

  // Выбор placeholder в зависимости от режима
  let placeholder = 'What’s up?';
  if (isJustifyMode) placeholder = 'Ask anything for web search…';
  else if (isDeepSearchMode) placeholder = 'Ask for deep research…';
  else if (isCreateImageMode)
    placeholder = 'Describe the image you want to create…';
  else if (isCanvasMode) placeholder = 'Write text or code';
  else if (isThinkLongerMode) placeholder = 'Ask for a more detailed answer…';

  // Показывать меню стилей только если выбран режим Create image
  useEffect(() => {
    if (isCreateImageMode) {
      setIsStylePopoverOpen(true);
    } else {
      setIsStylePopoverOpen(false);
    }
  }, [isCreateImageMode]);

  return (
    <>
      {/* Drag & drop overlay */}
      {isDraggingFile && (
        <div
          className="fixed inset-0 bg-black/60 z-[1000] flex flex-col items-center justify-center"
          onDrop={handleOverlayDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Paperclip className="size-16 text-white mb-4" />
          <span className="text-white text-2xl font-semibold mb-2">
            Drop your files here to chat
          </span>
        </div>
      )}
      {/* Превью файлов над MultimodalInput */}
      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 mb-2 z-50">
          {attachments.map((file: any) => (
            <div
              key={file.url || file.name}
              className="flex items-center bg-gray-100 rounded-xl px-4 py-2 shadow"
            >
              <Paperclip className="size-6 text-blue-500 mr-2" />
              <div>
                <div className="font-medium text-gray-800">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {file.size ? formatFileSize(file.size) : ''}
                </div>
              </div>
            </div>
          ))}
          {uploadQueue.map((filename) => (
            <div
              key={filename}
              className="flex items-center bg-gray-100 rounded-xl px-4 py-2 shadow opacity-60"
            >
              <Paperclip className="size-6 text-blue-500 mr-2" />
              <div>
                <div className="font-medium text-gray-800">{filename}</div>
                <div className="text-xs text-gray-500">Uploading…</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Основной input-блок */}
      <div
        className={`fixed h-auto py-1 pb-4 left-1/2 -translate-x-1/2 w-full max-w-[95%] md:max-w-[800px] z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out${open && width >= 768 && !openMobile ? ' md:ml-[130px]' : ''}${messages.length === 0 ? ' md:top-[calc(50%-280px)] bottom-0' : ' bottom-0'}`}
      >
        {/* Кнопка поиска чатов */}
        {userId && (
          <div className="w-full flex justify-end mb-2 pr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search chats"
                >
                  <Search className="size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="flex items-center gap-2">
                <span>Search chats</span>
                <HotkeyBadge hotkey={{ key: 'k', meta: true }} />
              </TooltipContent>
            </Tooltip>
            <ChatSearchDialog
              open={isSearchOpen}
              onOpenChange={setIsSearchOpen}
              user={session?.user}
            />
          </div>
        )}
        {/* Удаляем старое меню стилей сверху */}
        <div className="relative w-full max-w-[95%] md:max-w-2xl bg-white hover:bg-white flex flex-col gap-4  -mb-4">
          {!hasUserMessage && !input && (
            <SuggestedPrompts
              mode={
                isJustifyMode
                  ? 'web'
                  : isDeepSearchMode
                    ? 'deep'
                    : isCreateImageMode
                      ? 'image'
                      : isCanvasMode
                        ? 'canvas'
                        : isThinkLongerMode
                          ? 'think'
                          : null
              }
              input={input}
              onSelect={(prompt) => {
                append({ role: 'user', content: prompt }); // отправить сразу
              }}
            />
          )}
          <div className="flex items-center w-full relative">
            <Textarea
              data-testid="multimodal-input"
              ref={textareaRef}
              placeholder={placeholder}
              value={isMenuSelected ? `${input} →` : input}
              onChange={handleInput}
              className={`min-h-[60px] max-h-[400px] overflow-auto resize-none rounded-[30px] !text-base bg-white dark:bg-gray-900 pb-16 px-6 pt-4 border border-gray-300 shadow-md dark:border-gray-600 focus:border-gray-200 focus-visible:border-gray-200 focus:ring-0 focus-visible:ring-0 transition-[height] duration-200 ease-in-out${(isCommandMenuOpen && /^(Justify|Search|Research|Deep Research|Generate Image)\b/.test(input)) || isMenuSelected ? ' font-bold text-blue-600' : ''}${className ? ` ${className}` : ''}`}
              rows={1}
              autoFocus
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();

                  if (status !== 'ready') {
                    toast.error('The Lumia A.i is answering now, wait!');
                  } else {
                    submitForm();
                    // Добавляем класс для анимации перемещения вниз
                    const container = event.currentTarget.closest(
                      'div[class*="fixed"]',
                    );
                    if (container) {
                      container.classList.remove('bottom-[40%]');
                      container.classList.add('bottom-0');
                    }
                  }
                }
              }}
            />
          </div>

          <div className="absolute bottom-0 p-2 w-full flex flex-row justify-between items-center">
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={`rounded-full bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 ml-0 px-3 py-1.5 text-sm font-normal shadow-none`}
                    variant="ghost"
                    disabled
                    onClick={(event) => {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }}
                  >
                    <PlusIcon className="size-9" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Attach files and more
                </TooltipContent>
              </Tooltip>

              {/* Instruments button and popover (disabled) */}
              <Popover open={false} onOpenChange={() => {}}>
                <PopoverTrigger asChild>
                  <Button
                    className="rounded-full bg-white flex items-center gap-2 px-3 py-1.5 text-sm font-normal text-gray-400 shadow-none hover:bg-gray-100 ml-2 cursor-not-allowed"
                    variant="ghost"
                    type="button"
                    aria-label="Instruments"
                    disabled
                  >
                    <SlidersHorizontal className="size-4 mr-1" />
                    {!(
                      isJustifyMode ||
                      isDeepSearchMode ||
                      isCreateImageMode ||
                      isCanvasMode ||
                      isThinkLongerMode
                    ) && 'Instruments'}
                  </Button>
                </PopoverTrigger>
                {/* Контент поповера отключен, чтобы блок не работал */}
              </Popover>
              {/* Активный режим */}
              {(isJustifyMode ||
                isDeepSearchMode ||
                isCreateImageMode ||
                isCanvasMode ||
                isThinkLongerMode) && (
                <>
                  <span className="mx-1 h-6 w-px bg-gray-200 inline-block align-middle" />
                  {/* Кнопка "Изображение" и "Стили" только для Create image */}
                  {isCreateImageMode && (
                    <>
                      <span className="flex items-center gap-2">
                        <ImageIcon className="size-5 text-blue-500" />
                        <span className="text-blue-600 font-medium">Image</span>
                        <button
                          type="button"
                          className="ml-1 text-gray-400 hover:text-gray-600 text-lg"
                          onClick={() => {
                            setIsCreateImageMode(false);
                          }}
                          aria-label="Убрать изображение"
                        >
                          ×
                        </button>
                      </span>
                      <Popover
                        open={isStylePopoverOpen}
                        onOpenChange={setIsStylePopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            className="ml-4 flex items-center gap-2 px-2 py-1 rounded-full text-sm font-normal text-black bg-white hover:bg-gray-100 shadow-none"
                            variant="ghost"
                          >
                            <Palette className="size-5" />
                            <span className="ml-1">Styles</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-[200px] p-1 flex flex-col gap-0.5 rounded-xl shadow-lg border border-gray-200"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {IMAGE_STYLES.map((style) => (
                              <button
                                key={style.key}
                                className="flex flex-col items-center px-1 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none"
                                onClick={() => {
                                  setInput(style.prompt);
                                  setIsStylePopoverOpen(false);
                                }}
                                type="button"
                              >
                                <span className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full mb-1">
                                  {style.icon}
                                </span>
                                <span className="text-xs text-black text-center leading-tight">
                                  {style.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </>
                  )}
                  {/* Кнопка закрытия режима */}
                  {!isCreateImageMode && (
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-base font-normal text-blue-600 bg-white hover:bg-blue-50 transition shadow-none"
                      onClick={() => {
                        setIsJustifyMode(false);
                        setIsDeepSearchMode(false);
                        setIsCreateImageMode(false);
                        setIsCanvasMode(false);
                        setIsThinkLongerMode(false);
                      }}
                    >
                      {isJustifyMode && <Lightbulb className="size-4" />}
                      {isDeepSearchMode && <Telescope className="size-4" />}
                      {isCanvasMode && <Paintbrush className="size-4" />}
                      {isThinkLongerMode && <Sparkles className="size-4" />}
                      <span className="ml-1">
                        {isJustifyMode && 'Web search'}
                        {isDeepSearchMode && 'Deep research'}
                        {isCanvasMode && 'Canvas'}
                        {isThinkLongerMode && 'Think longer'}
                      </span>
                      <span className="ml-1 cursor-pointer text-blue-400 hover:text-blue-600">
                        ×
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 h-12">
                {status === 'submitted' ? (
                  <StopButton stop={stop} setMessages={setMessages} />
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SendButton
                        input={input}
                        submitForm={submitForm}
                        uploadQueue={uploadQueue}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="flex items-center gap-2">
                      <span>Send message</span>
                      <HotkeyBadge hotkey={{ key: 'Enter' }} />
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <input
            type="file"
            className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            tabIndex={-1}
          />

          {(attachments.length > 0 || uploadQueue.length > 0) && (
            <div
              data-testid="attachments-preview"
              className="flex flex-row gap-2 overflow-x-scroll items-end px-4"
            >
              {attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}

              {uploadQueue.map((filename) => (
                <PreviewAttachment
                  key={filename}
                  attachment={{
                    url: '',
                    name: filename,
                    contentType: '',
                  }}
                  isUploading={true}
                />
              ))}
            </div>
          )}
        </div>
        {messages.length > 0 && (
          <p className="mt-5 text-center text-sm text-gray-500 hidden md:block">
            Lumia may contain errors. We recommend that you check important
            information.
          </p>
        )}
      </div>
      {isJustifyMode && (webSearchLoading || webSearchResults) && (
        <div className="mb-4">
          {webSearchLoading && (
            <div className="text-gray-400">Поиск в интернете…</div>
          )}
          {webSearchResults && (
            <>
              {webSearchResults.formatted && (
                <div className="mb-4">
                  <Markdown>{webSearchResults.formatted}</Markdown>
                </div>
              )}
              {webSearchResults.results?.length > 0 && (
                <div className="mb-2">
                  <div className="font-semibold mb-1">Результаты поиска</div>
                  <SearchResults
                    results={webSearchResults.results.map((r: any) => ({
                      title: r.title,
                      url: r.url,
                      content: r.snippet,
                    }))}
                  />
                </div>
              )}
              {webSearchResults.images?.length > 0 && (
                <div className="mb-2">
                  <div className="font-semibold mb-1">Изображения</div>
                  <SearchResultsImageSection
                    images={webSearchResults.images.map((img: any) => ({
                      url: img.url,
                      description: img.alt,
                    }))}
                  />
                </div>
              )}
              {webSearchResults.videos?.length > 0 && (
                <div className="mb-2">
                  <div className="font-semibold mb-1">Видео</div>
                  <VideoSearchResults
                    results={{
                      videos: webSearchResults.videos,
                      searchParameters: { q: '', type: '', engine: '' },
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;

    return true;
  },
);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      data-testid="stop-button"
      variant={undefined}
      className={`rounded-full mr-1 mt-2 size-8 flex items-center justify-center bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:bg-black`}
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={7} />
    </Button>
  );
}
const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  const isInputEmpty = input.length === 0 && uploadQueue.length === 0;
  return (
    <Button
      data-testid="send-button"
      className={`rounded-full mr-1 size-9 flex items-center justify-center bg-black text-white hover:bg-black/90${
        isInputEmpty ? ' disabled:bg-black disabled:text-white' : ''
      }`}
      onClick={(event) => {
        event.preventDefault();
        if (!isInputEmpty) submitForm();
      }}
      disabled={isInputEmpty}
    >
      {isInputEmpty ? (
        <AudioLines className="size-5" strokeWidth={3} />
      ) : (
        <ArrowUp className="size-5" strokeWidth={3} />
      )}
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
