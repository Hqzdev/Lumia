'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { cn } from '@/lib/utils';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { MessageSquareDiff } from 'lucide-react';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { VisibilityType, VisibilitySelector } from './visibility-selector';

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

  return (
    <header
      className={cn(
        'flex fixed top-0 left-0 w-full z-50 bg-background py-2 items-center px-3 md:px-4 gap-3 shadow-sm transition-all duration-300 h-[56px]',
        open && windowWidth >= 768 ? 'md:ml-[260px]' : 'ml-0'
      )}
    >
      {/* MOBILE: SidebarToggle left, ModelSelector center, NewChat right */}
      {windowWidth < 768 ? (
        <>
          <div className="flex flex-1 items-center">
            <SidebarToggle />
          </div>
          <div className="flex flex-1 justify-center">
            {!isReadonly && (
              <ModelSelector
                selectedModelId={selectedModelId}
                className="mx-auto"
              />
            )}
          </div>
          <div className="flex flex-1 justify-end items-center">
            <Button
              variant="outline"
              className="p-0 size-[38px] rounded-xl [&_svg]:size-[22px] text-[#6B7280]"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <MessageSquareDiff />
            </Button>
          </div>
        </>
      ) : (
        <>
          {(!open || windowWidth < 768) && (!openMobile || windowWidth >= 768) && <SidebarToggle />}

          {(!open || windowWidth < 768) && (!openMobile || windowWidth >= 768) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="p-0 size-[38px] rounded-xl hover:text-[#6B7280] hover:bg-gray-200 [&_svg]:size-[22px] text-[#6B7280] ${className}"
                  onClick={() => {
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <MessageSquareDiff />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
          )}

          {!isReadonly && (!openMobile || windowWidth >= 768) && (
            <ModelSelector
              selectedModelId={selectedModelId}
              className="order-1 md:order-2"
            />
          )}
        </>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
