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

export function JustifyModeToggle({
  onToggle,
  isJustifyMode: controlledIsJustifyMode,
  setIsJustifyMode: controlledSetIsJustifyMode,
}: {
  onToggle?: () => void,
  isJustifyMode?: boolean,
  setIsJustifyMode?: (v: boolean) => void
}) {
  const [uncontrolledIsJustifyMode, setUncontrolledIsJustifyMode] = useState(true)
  const isControlled = controlledIsJustifyMode !== undefined && controlledSetIsJustifyMode !== undefined;
  const isJustifyMode = isControlled ? controlledIsJustifyMode : uncontrolledIsJustifyMode;
  const setIsJustifyMode = isControlled ? controlledSetIsJustifyMode! : setUncontrolledIsJustifyMode;
  const { width } = useWindowSize();

  const [isPressed, setIsPressed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedMode = getCookie('justify-mode')
    if (savedMode !== null) {
      setIsJustifyMode(savedMode === 'true')
    }
  }, [setIsJustifyMode]);

  useEffect(() => {
    if (isPressed) {
      const timeout = setTimeout(() => setIsPressed(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isPressed]);

  useEffect(() => {
    if (width > 768) {
      setIsExpanded(true);
    }
  }, [width]);

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
            setIsExpanded(true);
            handleJustifyModeChange(pressed);
          }}
          className={cn(
            'gap-0.5 py-1 rounded-full ml-2 border transition-all duration-300 flex items-center justify-center',
            isJustifyMode
              ? 'bg-blue-100 text-blue-600 border-blue-100 hover:bg-blue-200 hover:text-blue-700'
              : 'bg-background text-muted-foreground border-gray-200',
            isPressed ? 'scale-95 shadow-md' : 'scale-100',
            'active:scale-95 focus:outline-none transform',
            width <= 768 ? (isExpanded ? 'w-28 px-3' : 'w-9 px-0') : 'w-28 px-3'
          )}
          style={{
            transition: 'all 0.3s ease',
          }}
        >
          <Globe className="size-4" />
          {(isExpanded || width > 768) && (
            <span className="ml-2 text-sm font-medium">
              Justify
            </span>
          )}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        {isJustifyMode
          ? 'Justify mode is ON. Answers will be explained and reasoned.'
          : 'Justify mode is OFF. Toggle to enable detailed explanations.'}
      </TooltipContent>
    </Tooltip>
  );
}