'use client';

// Оптимизированный импорт date-fns (ШАГ 3)
import { isToday } from 'date-fns/isToday';
import { isYesterday } from 'date-fns/isYesterday';
import { subMonths } from 'date-fns/subMonths';
import { subWeeks } from 'date-fns/subWeeks';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { AlertTriangle, Pencil, ArchiveIcon  } from 'lucide-react';

import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Chat } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { useChatVisibility } from '@/hooks/use-chat-visibility';

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

type PureChatItemProps = {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
  onRename: (chat: Chat) => void;
};

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
  onRename,
  hoveredId,
  setHoveredId,
}: PureChatItemProps & { hoveredId?: string | null; setHoveredId?: (id: string | null) => void }) => {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibility: chat.visibility,
  });

  return (
    <SidebarMenuItem
      onMouseEnter={() => setHoveredId && setHoveredId(chat.id)}
      onMouseLeave={() => setHoveredId && setHoveredId(null)}
    >
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className={
              `mr-0.5 transition-opacity duration-200 bg-transparent hover:bg-transparent focus:bg-transparent text-sidebar-foreground ` +
              (hoveredId === chat.id ? 'opacity-100' : 'opacity-0')
            }
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          className="min-w-[220px]" // увеличиваем ширину меню
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <ShareIcon />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuPortal>
              {/* Share submenu content here if needed */}
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800"
            onSelect={() => {
              // TODO: Implement archive logic here
              // For now, just a placeholder
              // You might want to call a prop like onArchive(chat.id)
              alert('Archive feature coming soon!');
            }}
          >
            <ArchiveIcon className="size-4" />
            <span>Archive</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer  focus:bg-gray-100 dark:focus:bg-gray-800"
            onSelect={() => {
              onRename(chat);
            }}
          >
            <Pencil className="size-4" />
            <span>Rename</span>
          </DropdownMenuItem>

      

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => {
              onDelete(chat.id);
            }}
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const pathname = usePathname();
  const {
    data: history,
    isLoading,
    error,
    mutate,
  } = useSWR<Array<Chat>>(user ? '/api/history' : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    onError: (err) => {
      console.error('Failed to load chat history:', err);
    },
  });

  // Обновляем список чатов при изменении пути (например, после создания нового чата)
  useEffect(() => {
    if (user && pathname) {
      // Небольшая задержка, чтобы избежать конфликтов с первоначальной загрузкой
      const timeoutId = setTimeout(() => {
    mutate();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [pathname, user, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Rename dialog state
  const [renameChat, setRenameChat] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const router = useRouter();

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== id);
          }
        });
        return 'Chat deleted successfully';
      },
      error: 'Failed to delete chat',
    });

    setIsDeleteDialogOpen(false);

    if (deleteId === id) {
      router.push('/');
    }
  };

  const handleRename = async () => {
    if (!renameChat) return;
    setIsRenaming(true);

    const renamePromise = fetch(`/api/chat?id=${renameChat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: renameValue }),
    });

    toast.promise(renamePromise, {
      loading: 'Renaming chat...',
      success: async () => {
        await mutate();
        setRenameChat(null);
        setRenameValue('');
        setIsRenaming(false);
        return 'Chat renamed successfully';
      },
      error: () => {
        setIsRenaming(false);
        return 'Failed to rename chat';
      },
    });
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (error) {
    console.error('Error loading chat history:', error);
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-red-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Failed to load chats. Please refresh the page.
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
          Today
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="rounded-md h-8 flex gap-2 px-2 items-center"
              >
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (history?.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Start a chat to see your conversation history here!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupChatsByDate = (chats: Chat[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
      (groups, chat) => {
        const chatDate = new Date(chat.createdAt);

        if (isToday(chatDate)) {
          groups.today.push(chat);
        } else if (isYesterday(chatDate)) {
          groups.yesterday.push(chat);
        } else if (chatDate > oneWeekAgo) {
          groups.lastWeek.push(chat);
        } else if (chatDate > oneMonthAgo) {
          groups.lastMonth.push(chat);
        } else {
          groups.older.push(chat);
        }

        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as GroupedChats,
    );
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {history &&
              (() => {
                const groupedChats = groupChatsByDate(history);

                return (
                  <>
                    {groupedChats.today.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Today
                        </div>
                        {groupedChats.today.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setIsDeleteDialogOpen(true);
                            }}
                            setOpenMobile={setOpenMobile}
                            onRename={(chat) => {
                              setRenameChat(chat);
                              setRenameValue(chat.title);
                            }}
                            hoveredId={hoveredId}
                            setHoveredId={setHoveredId}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Yesterday
                        </div>
                        {groupedChats.yesterday.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setIsDeleteDialogOpen(true);
                            }}
                            setOpenMobile={setOpenMobile}
                            onRename={(chat) => {
                              setRenameChat(chat);
                              setRenameValue(chat.title);
                            }}
                            hoveredId={hoveredId}
                            setHoveredId={setHoveredId}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Last 7 days
                        </div>
                        {groupedChats.lastWeek.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setIsDeleteDialogOpen(true);
                            }}
                            setOpenMobile={setOpenMobile}
                            onRename={(chat) => {
                              setRenameChat(chat);
                              setRenameValue(chat.title);
                            }}
                            hoveredId={hoveredId}
                            setHoveredId={setHoveredId}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Last 30 days
                        </div>
                        {groupedChats.lastMonth.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setIsDeleteDialogOpen(true);
                            }}
                            setOpenMobile={setOpenMobile}
                            onRename={(chat) => {
                              setRenameChat(chat);
                              setRenameValue(chat.title);
                            }}
                            hoveredId={hoveredId}
                            setHoveredId={setHoveredId}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.older.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50 mt-6">
                          Older
                        </div>
                        {groupedChats.older.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setIsDeleteDialogOpen(true);
                            }}
                            setOpenMobile={setOpenMobile}
                            onRename={(chat) => {
                              setRenameChat(chat);
                              setRenameValue(chat.title);
                            }}
                            hoveredId={hoveredId}
                            setHoveredId={setHoveredId}
                          />
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-2 text-xl">Delete chat</DialogTitle>
          </DialogHeader>

          <div className="text-gray-600">
            Are you sure you want to delete this chat? This action cannot be undone.
          </div>

          <div className="bg-white p-3 rounded-lg flex gap-2 items-start text-sm text-gray-500">
            <AlertTriangle className="size-5 text-red-400 shrink-0" />
            <div>
              <strong>
                Warning: <span className="text-red-600">This action is permanent</span>
              </strong>
              <div className="text-xs">
                All messages and history in this chat will be permanently deleted.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="text-gray-500 hover:text-blue-600 bg-white hover:bg-white rounded-lg"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="text-red-600 hover:text-red-700 bg-white hover:bg-white"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Rename Dialog */}
      <Dialog open={!!renameChat} onOpenChange={(open) => {
        if (!open) {
          setRenameChat(null);
          setRenameValue('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-2 text-xl">Rename chat</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleRename();
            }}
          >
            <div className="mb-4">
              <input
                className="w-full border rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                maxLength={100}
                autoFocus
                placeholder="Enter new chat name"
                disabled={isRenaming}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                className="text-gray-500 hover:text-blue-600 bg-white hover:bg-white rounded-lg"
                onClick={() => {
                  setRenameChat(null);
                  setRenameValue('');
                }}
                disabled={isRenaming}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-blue-600 hover:text-blue-700 bg-white hover:bg-white"
                disabled={isRenaming || !renameValue.trim() || renameValue === renameChat?.title}
              >
                {isRenaming ? 'Renaming...' : 'Rename'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
