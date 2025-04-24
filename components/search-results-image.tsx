/* eslint-disable @next/next/no-img-element */
'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { useEffect, useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { SearchResultImage } from '@/lib/types'

interface SearchResultsImageSectionProps {
  images: SearchResultImage[]
  query?: string
}

export const SearchResultsImageSection: React.FC<SearchResultsImageSectionProps> = ({ images, query }) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  useEffect(() => {
    if (api) {
      api.scrollTo(selectedIndex, true)
    }
  }, [api, selectedIndex])

  if (!images || images.length === 0) {
    return <div className="text-muted-foreground">No images found</div>
  }

  const convertedImages = typeof images[0] === 'string' 
    ? (images as string[]).map(image => ({ url: image, description: '' }))
    : images as { url: string; description: string }[]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {convertedImages.slice(0, 4).map((image, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div
              className="aspect-video cursor-pointer relative group"
              onClick={() => setSelectedIndex(index)}
            >
              <Card className="h-full transition-transform group-hover:scale-[1.02]">
                <CardContent className="p-0 size-full">
                  {image ? (
                    <img
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      className="size-full object-cover rounded-md"
                      onError={e => (e.currentTarget.src = '/images/placeholder-image.png')}
                    />
                  ) : (
                    <div className="size-full bg-muted animate-pulse rounded-md" />
                  )}
                </CardContent>
              </Card>
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/30 rounded-md flex items-center justify-center text-white/80 text-sm">
                  <PlusCircle size={24} />
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Search Images</DialogTitle>
              <DialogDescription className="text-sm">{query}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Carousel
                setApi={setApi}
                className="w-full bg-muted rounded-lg"
              >
                <CarouselContent>
                  {convertedImages.map((img, idx) => (
                    <CarouselItem key={idx}>
                      <div className="p-1 flex items-center justify-center">
                        <img
                          src={img.url}
                          alt={`Image ${idx + 1}`}
                          className="max-h-[60vh] w-auto object-contain rounded-md"
                          onError={e => (e.currentTarget.src = '/images/placeholder-image.png')}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute inset-8 flex items-center justify-between p-4">
                  <CarouselPrevious className="size-10 rounded-full shadow focus:outline-none">
                    <span className="sr-only">Previous</span>
                  </CarouselPrevious>
                  <CarouselNext className="size-10 rounded-full shadow focus:outline-none">
                    <span className="sr-only">Next</span>
                  </CarouselNext>
                </div>
              </Carousel>
              <div className="py-2 text-center text-sm text-muted-foreground">
                {current} of {count}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}