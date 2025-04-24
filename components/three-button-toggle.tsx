'use client'

import { cn } from '@/lib/utils'
import { Ellipsis, SquareChartGantt, Brush } from 'lucide-react'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

export function EllipsisModeToggle({ onSectionSelect }: { onSectionSelect?: (text: string) => void }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<'artifact' | 'canvas' | null>(null)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'ml-2 rounded-full border border-gray-200 text-muted-foreground bg-background',
                'hover:bg-gray-100 transition-all duration-300'
              )}
            >
              <Ellipsis className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Viewing tools</TooltipContent>
      </Tooltip>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-64 rounded-2xl border border-gray-200 p-4 space-y-3"
      >
        {/* Artifact */}
        <button
          onClick={() => {
            setSelected('artifact');
            if (onSectionSelect) onSectionSelect('Artifact');
            setOpen(false);
          }}
          className={cn(
            'w-full flex items-start gap-3 p-2 rounded-xl transition-all',
            selected === 'artifact'
              ? 'bg-blue-50 ring-1 ring-blue-200'
              : 'hover:bg-gray-50'
          )}
        >
          <div className="bg-gray-100 p-1 rounded-full">
            <SquareChartGantt className="text-gray-600" size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium text-md">Artifact</p>
            <p className="text-xs text-muted-foreground">
              Write structured content with live collaboration
            </p>
          </div>
        </button>

        <div className="h-px bg-gray-200 my-1" />

        {/* Canvas */}
        <button
          onClick={() => {
            setSelected('canvas');
            if (onSectionSelect) onSectionSelect('Canvas');
            setOpen(false);
          }}
          className={cn(
            'w-full flex items-start gap-3 p-2 rounded-xl transition-all',
            selected === 'canvas'
              ? 'bg-blue-50 ring-1 ring-blue-200'
              : 'hover:bg-gray-50'
          )}
        >
          <div className="bg-gray-100 p-1 rounded-full">
            <Brush className="text-gray-600" size={20} />
          </div>
          <div className="text-left">
            <p className="font-medium text-md">Canvas</p>
            <p className="text-xs text-muted-foreground">
              Visualize, organize, and explore ideas freely
            </p>
          </div>
        </button>
      </PopoverContent>
    </Popover>
  )
}
