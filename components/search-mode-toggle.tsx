import { cn } from '@/lib/utils'
import { Globe } from 'lucide-react'
import { useWindowSize } from 'usehooks-ts'
import { useEffect, useState } from 'react'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SearchModeToggle({ isSearchMode, setIsSearchMode }: { isSearchMode: boolean; setIsSearchMode: (v: boolean) => void }) {
  const { width } = useWindowSize();
  const [isPressed, setIsPressed] = useState(false);

  const handleSearchModeChange = (pressed: boolean) => {
    setIsSearchMode(pressed);
    if (pressed) {
      console.log('Search mode ON');
    } else {
      console.log('Search mode OFF');
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
          aria-label="Search on the net"
          pressed={isSearchMode}
          onPressedChange={(pressed) => {
            setIsPressed(true);
            handleSearchModeChange(pressed);
          }}
          className={cn(
            'gap-0.5 px-3 py-1 rounded-full ml-2 border transition-all duration-300',
            isSearchMode
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
        Search on the net
      </TooltipContent>
    </Tooltip>
  )
}
