import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWindowSize } from 'usehooks-ts'

export function JustifyModeToggle({ onToggle, isJustifyMode: controlledIsJustifyMode, setIsJustifyMode: controlledSetIsJustifyMode }: { onToggle?: () => void, isJustifyMode?: boolean, setIsJustifyMode?: (v: boolean) => void }) {
  const [uncontrolledIsJustifyMode, setUncontrolledIsJustifyMode] = useState(true)
  const isControlled = controlledIsJustifyMode !== undefined && controlledSetIsJustifyMode !== undefined;
  const isJustifyMode = isControlled ? controlledIsJustifyMode : uncontrolledIsJustifyMode;
  const setIsJustifyMode = isControlled ? controlledSetIsJustifyMode! : setUncontrolledIsJustifyMode;
  const { width } = useWindowSize();

  // Добавляем состояние для анимации нажатия
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const savedMode = getCookie('justify-mode')
    if (savedMode !== null) {
      setIsJustifyMode(savedMode === 'true')
    }
  }, [setIsJustifyMode])

  // Сброс анимации после окончания transition
  useEffect(() => {
    if (isPressed) {
      const timeout = setTimeout(() => setIsPressed(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isPressed]);

  const handleJustifyModeChange = (pressed: boolean) => {
    setIsJustifyMode(pressed)
    setCookie('justify-mode', pressed.toString())
    if (onToggle) onToggle()
    if (pressed) {
      console.log('Justify mode ON')
    } else {
      console.log('Justify mode OFF')
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          aria-label="Toggle justify mode"
          pressed={isJustifyMode}
          onPressedChange={(pressed) => {
            setIsPressed(true);
            handleJustifyModeChange(pressed);
          }}
          className={cn(
            'gap-0.5 px-3 py-1 rounded-full ml-2 border transition-all duration-300',
            isJustifyMode
              ? 'bg-blue-100 text-blue-600 border-blue-100 hover:bg-blue-200 hover:text-blue-700'
              : 'bg-background text-muted-foreground border-gray-200',
            // Добавляем анимацию нажатия
            isPressed ? 'scale-95 shadow-md' : 'scale-100',
            'active:scale-95',
            'focus:outline-none',
            'transform'
          )}
          style={{
            transition: 'background 0.3s, color 0.3s, border 0.3s, box-shadow 0.2s, transform 0.15s cubic-bezier(0.4,0,0.2,1)'
          }}
        >
          <Globe className="size-4" />
          {width > 768 && <span className="text-xs ml-1">Search</span>}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="top">
        Toggle search mode
      </TooltipContent>
    </Tooltip>
  )
}
