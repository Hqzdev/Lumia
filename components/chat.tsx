'use client';

import { useChat } from '@ai-sdk/react';
import { useState, memo, Suspense } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Динамический импорт тяжелых компонентов для улучшения производительности на мобильных
const Artifact = dynamic(() => import('./artifact').then((mod) => ({ default: mod.Artifact })), {
  ssr: false,
});

const Messages = dynamic(() => import('./messages').then((mod) => ({ default: mod.Messages })), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Loading...</div>
});

const MultimodalInput = dynamic(() => import('@/components/multimodal-input').then((mod) => ({ default: mod.MultimodalInput })), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[95%] md:max-w-[800px] h-20 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800" />
  )
});

// Динамический импорт framer-motion для улучшения производительности
// Создаем обертку для анимированного контейнера
const AnimatedChatWrapper = dynamic(
  () =>
    import('framer-motion').then((mod) => {
      return function AnimatedChatContainer(props: React.ComponentProps<'div'>) {
        const MotionDiv = mod.motion.div;
        // Исключаем конфликтующие props для Framer Motion
        const {
          onDrag,
          onDragStart,
          onDragEnd,
          onAnimationStart,
          onAnimationEnd,
          onTransitionStart,
          onTransitionEnd,
          ...motionProps
        } = props;
        return (
          <MotionDiv
            {...motionProps}
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { type: 'spring', stiffness: 120, damping: 18 },
            }}
            exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}
            layout
          />
        );
      };
    }),
  { ssr: false }
);

const AnimatePresenceWrapper = dynamic(
  () =>
    import('framer-motion').then((mod) => mod.AnimatePresence),
  { ssr: false }
);

export const Chat = memo(function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  nickname,
}: {
  id: string;
  initialMessages: Array<import('ai').UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  nickname?: string;
}) {
  const { mutate } = useSWRConfig();

  const [isSearchMode, setIsSearchMode] = useState(false);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: (error) => {
      console.error('Error in useChat:', error);
      toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<
    Array<import('ai').Attachment>
  >([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Fallback на обычный div если анимации не загрузились
  const ChatContainer = AnimatedChatWrapper || ((props: React.ComponentProps<'div'>) => <div {...props} />);
  const AnimateWrapper = AnimatePresenceWrapper || (({ children }: { children: React.ReactNode }) => <>{children}</>);

  return (
    <AnimateWrapper>
      <ChatContainer
        key="chat-main"
        className="flex flex-col min-w-0 h-dvh bg-background pt-[56px]"
      >
        <ChatHeader
          chatId={id}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />
        <div
          className={`flex-1 flex flex-col ${messages.length === 0 ? 'justify-center' : ''} pb-28`}
        >
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading messages...</div>}>
            <Messages
              chatId={id}
              status={status}
              votes={votes}
              messages={messages}
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
              isArtifactVisible={isArtifactVisible}
              selectedChatModel={selectedChatModel}
              nickname={nickname}
            />
          </Suspense>
        </div>
        {!isReadonly && !isArtifactVisible && (
          <Suspense fallback={<div className="h-20" />}>
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              isSearchMode={isSearchMode}
              setIsSearchMode={setIsSearchMode}
            />
          </Suspense>
        )}
      </ChatContainer>
      {isArtifactVisible && (
        <Suspense fallback={null}>
          <Artifact
            key="chat-artifact"
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
            votes={votes}
            isReadonly={isReadonly}
          />
        </Suspense>
      )}
    </AnimateWrapper>
  );
});
