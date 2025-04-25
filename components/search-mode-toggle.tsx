import { cn } from '@/lib/utils'
import { Globe } from 'lucide-react'
import { useWindowSize } from 'usehooks-ts'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SearchModeToggle({ isSearchMode, setIsSearchMode }: { isSearchMode: boolean; setIsSearchMode: (v: boolean) => void }) {
  const { width } = useWindowSize();

  const handleSearchModeChange = (pressed: boolean) => {
    setIsSearchMode(pressed);
    if (pressed) {
      console.log('Search mode ON');
    } else {
      console.log('Search mode OFF');
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          aria-label="Search on the net"
          pressed={isSearchMode}
          onPressedChange={handleSearchModeChange}
          className={cn(
            'gap-0.5 px-3 py-1 rounded-full ml-2 border transition-all duration-300',
            isSearchMode
              ? 'bg-blue-100 text-blue-600 border-blue-100 hover:bg-blue-200 hover:text-blue-700'
              : 'bg-background text-muted-foreground border-gray-200',
            ''
          )}
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
