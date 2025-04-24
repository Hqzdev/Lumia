'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SearchResultItem } from '@/lib/types'
import { ChevronDown, ChevronUp, Youtube } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'

export interface SearchResultsProps {
  results: SearchResultItem[]
}

export function SearchResults({ results }: SearchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedResults = isExpanded ? results : results.slice(0, 4)
  const hasMoreResults = results.length > 4

  const displayUrlName = (url: string) => {
    try {
      const hostname = new URL(url).hostname
      return hostname === 'www.youtube.com' ? 'YouTube' : hostname
    } catch {
      return url
    }
  }

  const getYouTubeThumbnail = (url: string): string | undefined => {
    try {
      const urlObj = new URL(url)
      const videoId = urlObj.searchParams.get('v')
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined
    } catch {
      return undefined
    }
  }

  const isYouTubeUrl = (url: string) => {
    try {
      return new URL(url).hostname.includes('youtube.com')
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {displayedResults.map((result, index) => {
          const thumbnail = isYouTubeUrl(result.url) ? getYouTubeThumbnail(result.url) : undefined
          
          return (
            <Link 
              key={index} 
              href={result.url} 
              target="_blank"
              className="block transition-transform hover:scale-[1.01]"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <div className="relative aspect-video w-48 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={result.title || ''}
                          width={192}
                          height={108}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <Youtube className="size-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-medium line-clamp-2">{result.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {result.content}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Avatar className="size-4">
                          <AvatarImage
                            src={`https://www.google.com/s2/favicons?domain=${result.url}`}
                            alt={displayUrlName(result.url)}
                          />
                          <AvatarFallback>
                            {displayUrlName(result.url)[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {displayUrlName(result.url)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
      {hasMoreResults && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="ml-2 size-4" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="ml-2 size-4" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}