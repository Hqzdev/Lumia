'use client';

import React, {
  useMemo,
  useOptimistic,
  useState,
  useEffect,
} from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';

// Helper to split "Lumia v1 Max" -> { base: "Lumia", version: "v1 Max" }
function splitModelName(name: string): { base: string; version: string } {
  // Try to split at first " v" (space + v + digit)
  const match = name.match(/^(Lumia)(?:\s+)(v.*)$/i);
  if (match) {
    return { base: match[1], version: match[2] };
  }
  // fallback: all before first digit is base, rest is version
  const fallback = name.match(/^([^\d]+)(.*)$/);
  if (fallback) {
    return { base: fallback[1].trim(), version: fallback[2].trim() };
  }
  return { base: name, version: '' };
}

// Only animate the version part
function AnimatedVersion({ version }: { version: string }) {
  const [displayed, setDisplayed] = useState(version);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (displayed !== version) {
      setFade(true);
      const timeout1 = setTimeout(() => {
        setDisplayed(version);
        setFade(false);
      }, 120);
      return () => clearTimeout(timeout1);
    }
  }, [version, displayed]);

  return (
    <span
      className={cn(
        'transition-opacity duration-200',
        fade ? 'opacity-0' : 'opacity-100',
      )}
      style={{ display: 'inline-block' }}
    >
      {displayed}
    </span>
  );
}

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const selectedChatModel = useMemo(
    () => chatModels.find((chatModel) => chatModel.id === optimisticModelId),
    [optimisticModelId],
  );

  // Split name into base and version
  const { base, version } = selectedChatModel
    ? splitModelName(selectedChatModel.name)
    : { base: '', version: '' };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          asChild
          className={cn(
            'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
            className,
          )}
        >
          <Button
            data-testid="model-selector"
            variant="outline"
            className="md:px-4 md:h-[38px] text-base px-3 h-[34px] text-gray-600 hover:text-gray-600 hover:bg-gray-200"
          >
            <span>
              {base}
              {version && ' '}
              <AnimatedVersion version={version} />
            </span>
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[300px]">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground select-none">
            <span>Model</span>
          </div>
          {chatModels.map((chatModel) => {
            const { id } = chatModel;
            const { base: itemBase, version: itemVersion } = splitModelName(
              chatModel.name,
            );

            return (
              <DropdownMenuItem
                data-testid={`model-selector-item-${id}`}
                key={id}
                onSelect={() => {
                  setOpen(false);
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                }}
                data-active={id === optimisticModelId}
                asChild
              >
                <button
                  type="button"
                  className="gap-4 group/item flex flex-row justify-between hover:bg-gray-200 items-center w-full"
                >
                  <div className="flex flex-col gap-1 items-start">
                    <div>
                      {itemBase}
                      {itemVersion && ' '}
                      <span className="font-medium">{itemVersion}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {chatModel.description}
                    </div>
                  </div>

                  <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                    <CheckCircleFillIcon />
                  </div>
                </button>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
