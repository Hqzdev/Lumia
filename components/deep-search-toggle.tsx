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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeepSearchModeChange = (pressed: boolean) => {
    setIsDeepSearchMode(pressed);
    if (pressed) {
      console.log('Deep search mode ON');
    } else {
      console.log('Deep search mode OFF');
    }
  };

  useEffect(() => {
    if (isPressed) {
      const timeout = setTimeout(() => setIsPressed(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isPressed]);

  useEffect(() => {
    if (width > 768) {
      setIsExpanded(true); // На больших экранах всегда развернуто
    }
  }, [width]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          aria-label="Toggle deepsearch mode"
          pressed={isDeepSearchMode}
          onPressedChange={(pressed) => {
            setIsPressed(true);
            setIsExpanded(true); // При нажатии расширяется
            handleDeepSearchModeChange(pressed);
          }}
          className={cn(
            'gap-0.5 py-1 rounded-full ml-2 border transition-all duration-300 flex items-center justify-center',
            isDeepSearchMode
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
          <Telescope className="size-4" />
          {(isExpanded || width > 768) && <span className="text-xs ml-1">Research</span>}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="top">
       Deep research
      </TooltipContent>
    </Tooltip>
  );
}
