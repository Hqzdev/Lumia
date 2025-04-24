import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/utils/cookies'
import { Globe } from 'lucide-react'
import { useEffect } from 'react'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWindowSize } from 'usehooks-ts'

export function SearchModeToggle({ isSearchMode, setIsSearchMode }: { isSearchMode: boolean; setIsSearchMode: (v: boolean) => void }) {
  useEffect(() => {
    const savedMode = getCookie('search-mode')
    if (savedMode !== null) {
      setIsSearchMode(savedMode === 'true')
    }
    // eslint-disable-next-line
  }, [])

  const { width } = useWindowSize();

  const handleSearchModeChange = (pressed: boolean) => {
    setIsSearchMode(pressed)
    setCookie('search-mode', pressed.toString())
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          aria-label="Toggle search mode"
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
        Toggle Search mode
      </TooltipContent>
    </Tooltip>
  )
}
