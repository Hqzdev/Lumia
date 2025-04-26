import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { Telescope } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWindowSize } from 'usehooks-ts'

export function DeepSearchToggle({ isDeepSearchMode, setIsDeepSearchMode }: { isDeepSearchMode: boolean; setIsDeepSearchMode: (v: boolean) => void }) {
  const { width } = useWindowSize();
  const [isPressed, setIsPressed] = useState(false);

  const handleDeepSearchModeChange = (pressed: boolean) => {
    setIsDeepSearchMode(pressed);
    if (pressed) {
      console.log('Deep search mode ON');
    } else {
      console.log('Deep search mode OFF');
    }
  };

  // Сброс анимации после окончания transition
  useEffect(() => {
    if (isPressed) {
      const timeout = setTimeout(() => setIsPressed(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isPressed]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          aria-label="Toggle deepsearch mode"
          pressed={isDeepSearchMode}
          onPressedChange={(pressed) => {
            setIsPressed(true);
            handleDeepSearchModeChange(pressed);
          }}
          className={cn(
            'gap-0.5 px-3 py-1 rounded-full ml-2 border transition-all duration-300',
            isDeepSearchMode
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
          <Telescope className="size-4" />
          {width > 768 && <span className="text-xs ml-1">Research</span>}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="top">
       Deep research
      </TooltipContent>
    </Tooltip>
  )
}
