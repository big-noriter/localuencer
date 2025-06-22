"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroImageSliderProps {
  images: { src: string; alt: string }[]
}

export default function HeroImageSlider({ images }: HeroImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi],
  )

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }
    emblaApi.on("select", onSelect)
    onSelect() // Set initial selected index
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground">이미지를 불러올 수 없어요! 😥</p>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      <div className="overflow-hidden rounded-2xl shadow-2xl h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div className="relative flex-[0_0_100%] h-full" key={index}>
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover object-top"
                priority={index === 0} // Prioritize loading the first image
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 text-foreground"
            aria-label="이전 이미지"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 text-foreground"
            aria-label="다음 이미지"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === selectedIndex ? "bg-primary scale-125" : "bg-muted hover:bg-muted-foreground/50"
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
