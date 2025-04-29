'use client';

import type { Attachment, Message } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useArtifactSelector, useArtifact } from '@/hooks/use-artifact';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

import { ArrowUpIcon, StopIcon } from './icons';
import { ArrowUp, Square, Paperclip, Search, Lightbulb, PlusIcon, MessageSquareDiff, Globe, Paintbrush, Image, SearchCheck } from 'lucide-react';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { SearchModeToggle } from './search-mode-toggle'
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import { DeepSearchToggle } from './deep-search-toggle';
import { JustifyModeToggle } from './justify-toggle';
import equal from 'fast-deep-equal';
import { UseChatHelpers, UseChatOptions } from '@ai-sdk/react';
import { EllipsisModeToggle } from './three-button-toggle';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useSidebar } from '@/components/ui/sidebar';
import { artifactCreatePrompt, regularPrompt, justifyPrompt, deepSearchPrompt } from '@/lib/ai/prompts';

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
  const [isJustifyMode, setIsJustifyMode] = useState(true);
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [customization, setCustomization] = useState<any>(null);

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
        .then(res => res.json())
        .then(data => {
          setCustomization(data.customization || null);
        })
        .catch(err => {
          console.error('[MultimodalInput] Error fetching customization:', err);
        });
    }
  }, [userId]);

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

    let userPrompt = input;
    let systemPrompt = undefined;
    // Обычный режим
    if (isJustifyMode) {
      systemPrompt = justifyPrompt;
    } else if (isDeepSearchMode) {
      systemPrompt = deepSearchPrompt;
    } else {
      systemPrompt = regularPrompt(customization);
    }
    if (systemPrompt) {
      console.log('systemPrompt для ИИ:', systemPrompt);
    }
    append({ role: 'user', content: userPrompt }, {
      experimental_attachments: attachments
    });
    setAttachments([]);
    setLocalStorageInput('');
    setInput('');
    resetHeight();
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
    // Лог финального сообщения
    console.log('Отправлен в ИИ (только пользовательский текст):', userPrompt);
  }, [attachments, append, setAttachments, setLocalStorageInput, width, chatId, input, isJustifyMode, isSearchMode, isDeepSearchMode, setInput, customization]);

  const uploadFile = async (file: File) => {
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
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

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
    [setAttachments],
  );

  return (
    <div
      className={cn(
        'fixed h-auto py-1 pb-4 left-1/2 -translate-x-1/2 w-full max-w-[800px] z-40 bg-white dark:bg-black flex flex-col justify-center items-center transition-all duration-300',
        open && width >= 768 && !openMobile && 'md:ml-[130px]', // половина ширины сайдбара
        messages.length === 0 ? 'md:bottom-[30px] bottom-0' : 'bottom-0' // Поднимаем контейнер выше только на десктопе
      )}
    >
      <div className="relative w-full max-w-2xl flex flex-col gap-4 rounded-[30px] bg-white dark:bg-black  shadow-lg border border-gray-200 -mb-4">
        <div className="flex items-center w-full relative">
          <Textarea
            data-testid="multimodal-input"
            ref={textareaRef}
            placeholder="What's up?"
            value={isMenuSelected ? (input + ' →') : input}
            onChange={handleInput}
            className={cx(
              'min-h-[60px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-[30px] !text-base bg-white dark:bg-gray-900 pb-16 px-6 pt-4 border border-gray-200 dark:border-gray-600 focus:border-gray-200 focus-visible:border-gray-200 focus:ring-0 focus-visible:ring-0',
              ((isCommandMenuOpen && /^(Justify|Search|Research|Deep Research|Generate Image)\b/.test(input)) || isMenuSelected) && 'font-bold text-blue-600',
              className,
            )}
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
                  const container = event.currentTarget.closest('div[class*="fixed"]');
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
                  className="rounded-full border border-gray-200 size-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-600"
                  variant="ghost"
                  onClick={(event) => {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }}
                >
                  <PlusIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Attach files and more
              </TooltipContent>
            </Tooltip>

 
            <DeepSearchToggle
              isDeepSearchMode={isDeepSearchMode}
              setIsDeepSearchMode={(v) => {
                // Если JustifyMode уже активен и пользователь хочет включить DeepSearch, выключаем JustifyMode
                if (v && isJustifyMode) {
                  setIsJustifyMode(false);
                }
                setIsDeepSearchMode(v);
              }}
            />
            <JustifyModeToggle
              onToggle={() => {}}
              isJustifyMode={isJustifyMode}
              setIsJustifyMode={(v) => {
                // Если DeepSearchMode уже активен и пользователь хочет включить JustifyMode, выключаем DeepSearchMode
                if (v && isDeepSearchMode) {
                  setIsDeepSearchMode(false);
                }
                setIsJustifyMode(v);
              }}
            />
          </div>

          <div>
            {status === 'submitted' ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : (
              <SendButton
                input={input}
                submitForm={submitForm}
                uploadQueue={uploadQueue}
              />
            )}
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
              <PreviewAttachment key={attachment.url} attachment={attachment} />
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
        <p className="mt-5 text-center text-sm text-gray-500">
          Lumia may contain errors. We recommend that you check important
          information.
        </p>
      )}
    </div>
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
      className="rounded-full mr-1 mt-2 size-8 flex items-center justify-center bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:bg-black"
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
  return (
    <Button
      data-testid="send-button"
      className={
        "rounded-full mr-1 mt-2 size-8 flex items-center justify-center bg-black text-white hover:bg-black/90" +
        (input.length === 0 || uploadQueue.length > 0 ? " disabled:bg-black disabled:text-white" : "")
      }
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUp className="size-5" strokeWidth={3} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});