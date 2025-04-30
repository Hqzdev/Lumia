'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { MessageSquareDiff, UserCircle, Compass, Settings2, Settings, ArrowUpCircle, Search, LogOut, Sun, Moon, Zap, Star, Award, Crown } from 'lucide-react';
import { useSidebar } from './ui/sidebar';
import { memo, useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { VisibilityType, VisibilitySelector } from './visibility-selector';
import { SettingsDialog } from './settings-dialog';
import { UpgradePlanDialog } from './upgrade-plan-dialog';
import { CustomizeLumiaDialog } from './customize-lumia-dialog';

// Theme switcher component (now returns just a button, no tooltip)
function ThemeToggleMenuItem() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    // Check initial theme
    if (
      typeof window !== 'undefined' &&
      (window.localStorage.getItem('theme') === 'dark' ||
        (!window.localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches))
    ) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) return null;

  return (
    <DropdownMenuItem onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
      {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    </DropdownMenuItem>
  );
}

// Функция для выбора иконки по подписке
function getProfileIconBySubscription(subscription: string | null | undefined) {
  switch (subscription) {
    case 'Free':
      return <Zap className="text-blue-500" />;
    case 'premium':
      return <Award className="text-blue-500" />;
    case 'Team':
      return <Crown className="text-blue-500" />;
    default:
      return <UserCircle />;
  }
}

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open, openMobile } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Получаем userId из сессии
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Локальный стейт для подписки (для мгновенного обновления иконки)
  const [localSubscription, setLocalSubscription] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('selectedSubscription') : null
  );

  useEffect(() => {
    const handleStorage = () => {
      setLocalSubscription(localStorage.getItem('selectedSubscription'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Для иконки профиля используем localSubscription, если есть, иначе session
  const userSubscription = localSubscription ?? session?.user?.subscription ?? null;

  // Profile button handler (for now, just go to /profile)
  const handleProfileClick = () => {
    router.push('/profile');
  };

  // Скрывать SidebarToggle и New Chat при открытом сайдбаре на desktop (>=768px)
  const shouldHideSidebarButtons = open && windowWidth >= 768;

  return (
    <header
      className={cn(
        // removed border utility classes if any existed (none present)
        'flex fixed top-0 left-0 w-full z-50 py-2 items-center bg-background dark:bg-background-dark px-3 md:px-4 gap-3 shadow-sm transition-all duration-300 h-[56px]',
        open && windowWidth >= 768 ? 'md:ml-[260px]' : 'ml-0'
      )}
    >
      {/* Всегда: SidebarToggle, ModelSelector, NewChat, Profile (слева направо) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!shouldHideSidebarButtons && (
          <>
            <SidebarToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="p-0 size-[38px] rounded-xl hover:text-[#6B7280] hover:bg-gray-200 [&_svg]:size-[22px] text-[#6B7280] ml-2"
                  onClick={() => {
                    router.push('/');
                    router.refresh();
                  }}
                  aria-label="New Chat"
                >
                  <MessageSquareDiff />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
          </>
        )}
        {/* Theme toggle button removed from here */}
        {!isReadonly && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ModelSelector
                  selectedModelId={selectedModelId}
                  className="ml-2"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Select model
            </TooltipContent>
          </Tooltip>
        )}
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="p-0 size-[38px] rounded-xl hover:text-[#6B7280] hover:bg-gray-200 [&_svg]:size-[22px] text-[#6B7280] ml-2"
                    aria-label="Profile"
                  >
                    {getProfileIconBySubscription(userSubscription)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom">
                  <DropdownMenuItem onClick={() => router.push('/lumia-explore')}>
                    <Compass className="mr-2 size-4" />
                    Explore Lumia
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsCustomizeOpen(true)}>
                    <Settings2 className="mr-2 size-4" />
                    Customize Lumia
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                  {/* Theme toggle menu item */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsUpgradeOpen(true)}>
                    <ArrowUpCircle className="mr-2 size-4" />
                    Upgrade Plan
                  </DropdownMenuItem>
                  <ThemeToggleMenuItem />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                    className="text-red-500"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="top">
              Profile & Settings
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {/* Spacer to push content to left */}
      <div className="flex-1" />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      {userId && (
        <UpgradePlanDialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen} userId={userId} />
      )}
      <CustomizeLumiaDialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen} />
    </header>
  );
}

export const ChatHeader = memo(
  PureChatHeader,
  (
    prevProps: {
      selectedModelId: string;
    },
    nextProps: {
      selectedModelId: string;
    }
  ) => {
    return prevProps.selectedModelId === nextProps.selectedModelId;
  }
);