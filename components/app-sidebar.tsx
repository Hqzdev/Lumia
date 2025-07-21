'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import { MessageSquareDiff, FolderPlus, Plus } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SidebarToggle } from './sidebar-toggle';
import useSWR from 'swr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import type { Chat } from '@/lib/db/schema';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handler for search button
  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  // Handler for new chat
  const handleNewChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMobile(false);
    router.push('/');
    router.refresh();
  };

  // Handler for new project
  const handleNewProjectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMobile(false);
    router.push('/projects/new');
    router.refresh();
  };

  // Цвет фона для сайдбара и кнопок сверху
  const sidebarBg = 'bg-zinc-100 dark:bg-zinc-900';
  // Цвет фона для кнопок сверху (чтобы совпадал с sidebarBg)
  const buttonBg = 'bg-zinc-100 dark:bg-zinc-900';
  // Цвет текста для блока ссылок ниже
  const sectionText = 'text-gray-700 dark:text-gray-300';

  return (
    <Sidebar className={`group-data-[side=left]:border-r-0 ${sidebarBg}`}>
      <SidebarHeader className={sidebarBg}>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center w-full">
            {/* Toggle sidebar on the left */}
            <div className="flex flex-row gap-2">
              <SidebarToggle className={buttonBg} />
            </div>
            {/* New Chat and Search on the right */}
            <div className="flex flex-row gap-2 ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={`p-0 size-[38px] rounded-xl hover:bg-gray-200 [&_svg]:size-[22px] text-[#6B7280] ${buttonBg}`}
                    onClick={handleNewChatClick}
                  >
                    <span className="sr-only">New Chat</span>
                    <MessageSquareDiff className="p-0 size-[42px] hover:bg-gray-200 rounded-xl [&_svg]:size-[24px] text-[#6B7280] ${className}" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={`p-0 size-[38px] rounded-xl hover:text-[#6B7280] hover:bg-gray-200 [&_svg]:size-[22px] text-[#6B7280] ${buttonBg}`}
                    onClick={handleSearchClick}
                  >
                    <span className="sr-only">Search</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="16.65"
                        y1="16.65"
                        x2="21"
                        y2="21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={sidebarBg}>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter className={sidebarBg}>
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
      <ChatSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        user={user}
      />
    </Sidebar>
  );
}

function ChatSearchDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User | undefined;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: chats, isLoading } = useSWR<Array<Chat>>(
    user ? '/api/history' : null,
  );

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
