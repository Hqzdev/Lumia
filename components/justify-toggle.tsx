import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { Lightbulb } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWindowSize } from 'usehooks-ts'

export function JustifyModeToggle({ onToggle }: { onToggle?: () => void }) {
  const [isJustifyMode, setIsJustifyMode] = useState(true)
  const { width } = useWindowSize();

  useEffect(() => {
    const savedMode = getCookie('justify-mode')
    if (savedMode !== null) {
      setIsJustifyMode(savedMode === 'true')
    }
  }, [])

  const handleJustifyModeChange = (pressed: boolean) => {
    setIsJustifyMode(pressed)
    setCookie('justify-mode', pressed.toString())
    if (onToggle) onToggle()
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          aria-label="Toggle justify mode"
          pressed={isJustifyMode}
          onPressedChange={handleJustifyModeChange}
          className={cn(
            'gap-0.5 px-3 py-1 rounded-full ml-2 border transition-all duration-300',
            isJustifyMode
              ? 'bg-blue-100 text-blue-600 border-blue-100 hover:bg-blue-200 hover:text-blue-700'
              : 'bg-background text-muted-foreground border-gray-200',
            ''
          )}
        >
          <Lightbulb className="size-4" />
          {width > 768 && <span className="text-xs ml-1">Justify</span>}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="top">
        Toggle justify mode
      </TooltipContent>
    </Tooltip>
  )
}
