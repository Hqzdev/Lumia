'use client';

import { useChat } from '@ai-sdk/react';
import { useState, memo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from '@/components/multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { searchPrompt, systemPrompt } from '@/lib/ai/prompts';
import { motion, AnimatePresence } from 'framer-motion';
import { Overview } from '@/components/overview';

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
    onError: () => {
      toast.error('An error occured, please try again!');
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

  return (
    <AnimatePresence>
      <motion.div
        key="chat-main"
        className="flex flex-col min-w-0 h-dvh bg-background pt-[56px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 120, damping: 18 },
        }}
        exit={{ opacity: 0, y: 30, transition: { duration: 0.2 } }}
        layout
      >
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />
        <div
          className={`flex-1 flex flex-col ${messages.length === 0 ? 'justify-center' : ''} pb-28`}
        >
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
        </div>
        {!isReadonly && !isArtifactVisible && (
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
        )}
      </motion.div>
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
    </AnimatePresence>
  );
});
