import { UIMessage } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { Overview } from './overview';
import { memo } from 'react';
import { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers['status'];
  votes: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedChatModel: string;
  nickname?: string;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  selectedChatModel,
  nickname,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {messages.length === 0 && <Overview nickname={nickname} />}
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          // Count user messages to determine if we need margin
          const userMessageCount = messages
            .slice(0, index + 1)
            .filter(m => m.role === 'user')
            .length;
          const needsMargin = userMessageCount % 3 === 0 && message.role === 'user';

          return (
            <motion.div
              key={message.id || `msg-${index}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } }}
              exit={{ y: 20, opacity: 0, transition: { duration: 0.2 } }}
              layout
              className={needsMargin ? 'mb-48' : ''}
            >
              <PreviewMessage
                chatId={chatId}
                message={message}
                isLoading={status === 'streaming' && messages.length - 1 === index}
                vote={
                  votes
                    ? votes.find((vote) => vote.messageId === message.id)
                    : undefined
                }
                setMessages={setMessages}
                reload={reload}
                isReadonly={isReadonly}
                selectedChatModel={selectedChatModel}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}
      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});