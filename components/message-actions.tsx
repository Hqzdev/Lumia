import type { Message } from 'ai';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';

import type { Vote } from '@/lib/db/schema';

import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import { toast } from 'sonner';
import { Files, ThumbsUp, ThumbsDown } from 'lucide-react';
import cn from 'classnames';

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
  className,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  className?: string;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === 'user') return null;

  return (
    <div
      className={cn(
        'w-[120px] inline-flex flex-row bg-black/5 rounded-full p-1 -gap-2 justify-between',
        className,
      )}
    >
      <Button
        className="py-1 px-2 h-fit text-gray-600 hover:text-blue-500"
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
          } else {
            toast.error("There's no text to copy!");
          }
        }}
      >
        <Files className="size-3 text-gray-500 hover:text-blue-600" />
      </Button>

      <div className="w-px h-4 bg-gray-300 my-auto" />

      <Button
        data-testid="message-upvote"
        className="py-1 px-2 h-fit text-muted-foreground hover:bg-transparent hover:text-blue-600 !pointer-events-auto"
        disabled={vote?.isUpvoted}
        variant="ghost"
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
                    {
                      chatId,
                      messageId: message.id,
                      isUpvoted: true,
                    },
                  ];
                },
                { revalidate: false },
              );

              return 'Succesfully!';
            },
            error: 'Failed to upvote response.',
          });
        }}
      >
        <ThumbsUp className="size-3 text-gray-500 hover:text-blue-600" />
      </Button>

      <div className="w-px h-5 bg-gray-300 my-auto" />

      <Button
        data-testid="message-downvote"
        className="py-1 px-2 h-fit text-muted-foreground hover:bg-transparent hover:text-blue-600 !pointer-events-auto"
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
                    {
                      chatId,
                      messageId: message.id,
                      isUpvoted: false,
                    },
                  ];
                },
                { revalidate: false },
              );

              return 'Succesfully!';
            },
            error: 'Failed to response.',
          });
        }}
      >
        <ThumbsDown className="size-3 text-gray-500 hover:text-blue-600" />
      </Button>
    </div>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
