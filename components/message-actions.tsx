'use client';

import { memo } from 'react';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';
import equal from 'fast-deep-equal';
import { toast } from 'sonner';
import cn from 'classnames';

import type { Message } from 'ai';
import type { Vote } from '@/lib/db/schema';

import { Button } from './ui/button';
import { Files, ThumbsUp, ThumbsDown, Pencil, Volume2 } from 'lucide-react';
import { useArtifact } from '@/hooks/use-artifact';

function CheckmarkIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  );
}

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
  className,
  copied,
  setCopied,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  className?: string;
  copied: boolean;
  setCopied: (v: boolean) => void;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();
  const { setArtifact } = useArtifact();

  if (isLoading || message.role === 'user') return null;

  const iconButtonClass =
    'p-1 text-gray-600 rounded-md h-7 w-7 hover:bg-gray-50 hover:text-gray-600 hover:!bg-gray-100 transition-all flex items-center justify-center';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1  p-1 ',
        className,
      )}
    >
      {/* Copy button */}
      <Button
        className={iconButtonClass}
        variant="ghost"
        onClick={async () => {
          const textFromParts = message.parts
            ?.filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('\n')
            .trim();

          if (textFromParts) {
            await copyToClipboard(textFromParts);
            toast.success('Copied to clipboard!');
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          } else {
            toast.error("There's no text to copy!");
          }
        }}
        aria-label="Copy"
      >
        {copied ? <CheckmarkIcon /> : <Files className="size-4" />}
      </Button>

      {/* Upvote button */}
      <Button
        data-testid="message-upvote"
        className={iconButtonClass}
        variant="ghost"
        disabled={vote?.isUpvoted}
        onClick={async () => {
          const upvote = fetch('/api/vote', {
            method: 'PATCH',
            body: JSON.stringify({
              chatId,
              messageId: message.id,
              type: 'up',
            }),
          });

          toast.promise(upvote, {
            loading: 'Upvoting Response...',
            success: () => {
              mutate<Array<Vote>>(
                `/api/vote?chatId=${chatId}`,
                (currentVotes) => {
                  if (!currentVotes) return [];
                  const votesWithoutCurrent = currentVotes.filter(
                    (vote) => vote.messageId !== message.id,
                  );
                  return [
                    ...votesWithoutCurrent,
                    { chatId, messageId: message.id, isUpvoted: true },
                  ];
                },
                { revalidate: false },
              );
              return 'Successfully upvoted!';
            },
            error: 'Failed to upvote response.',
          });
        }}
        aria-label="Upvote"
      >
        <ThumbsUp className="size-4" />
      </Button>

      {/* Downvote button */}
      <Button
        data-testid="message-downvote"
        className={iconButtonClass}
        variant="ghost"
        disabled={vote && !vote.isUpvoted}
        onClick={async () => {
          const downvote = fetch('/api/vote', {
            method: 'PATCH',
            body: JSON.stringify({
              chatId,
              messageId: message.id,
              type: 'down',
            }),
          });

          toast.promise(downvote, {
            loading: 'Downvoting Response...',
            success: () => {
              mutate<Array<Vote>>(
                `/api/vote?chatId=${chatId}`,
                (currentVotes) => {
                  if (!currentVotes) return [];
                  const votesWithoutCurrent = currentVotes.filter(
                    (vote) => vote.messageId !== message.id,
                  );
                  return [
                    ...votesWithoutCurrent,
                    { chatId, messageId: message.id, isUpvoted: false },
                  ];
                },
                { revalidate: false },
              );
              return 'Successfully downvoted!';
            },
            error: 'Failed to downvote response.',
          });
        }}
        aria-label="Downvote"
      >
        <ThumbsDown className="size-4" />
      </Button>

      {/* Voice button */}
      <Button
        className={iconButtonClass}
        variant="ghost"
        onClick={() => {
          toast('Playing voice (not implemented yet)');
        }}
        aria-label="Speak"
      >
        <Volume2 className="size-4" />
      </Button>

      {/* Edit button */}
      <Button
        className={iconButtonClass}
        variant="ghost"
        onClick={() => {
          setArtifact({
            documentId: message.id,
            kind: 'text',
            content: message.parts?.filter((part) => part.type === 'text').map((part) => part.text).join('\n') || '',
            title: 'Edit message',
            isVisible: true,
            status: 'idle',
            boundingBox: { top: 0, left: 0, width: 0, height: 0 },
          });
        }}
        aria-label="Edit"
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    return (
      equal(prevProps.vote, nextProps.vote) &&
      prevProps.isLoading === nextProps.isLoading
    );
  },
);
