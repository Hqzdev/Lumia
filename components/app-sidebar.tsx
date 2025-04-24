'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import { MessageSquareDiff, FolderPlus } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarToggle } from './sidebar-toggle';
import { Plus } from 'lucide-react'

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  // Handler for search button
  const handleSearchClick = () => {
    setOpenMobile(false);
    router.push('/search');
    router.refresh();
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
                    className={`p-0 h-[38px] w-[38px] rounded-xl [&_svg]:size-[22px] text-[#6B7280] ${buttonBg}`}
                    onClick={handleNewChatClick}
                  >
                    <span className="sr-only">New Chat</span>
                    <MessageSquareDiff className="p-0 h-[42px] w-[42px] rounded-xl [&_svg]:size-[24px] text-[#6B7280] ${className}" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={`p-0 h-[38px] w-[38px] rounded-xl [&_svg]:size-[22px] text-[#6B7280] ${buttonBg}`}
                    onClick={handleSearchClick}
                  >
                    <span className="sr-only">Search</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      <SidebarFooter className={sidebarBg}>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
