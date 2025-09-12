'use client';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Link from "next/link";

type Slide = { id: string | number; src: string; alt?: string, slug: string , name: string};

export default function EventsHeroCarousel({ slides }: { slides: Slide[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: false })
  );
  const [api, setApi] = React.useState<CarouselApi>();

  // スライドが変わるたびにタイマーをリセット
  React.useEffect(() => {
    if (!api) return;
    const handler = () => plugin.current?.reset();
    api.on('select', handler);
    return () => {
      api.off('select', handler);
    };
  }, [api]);

  if (!slides?.length) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="h-40 md:h-56 w-full bg-muted rounded-lg grid place-items-center text-muted-foreground">
          画像がありません
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: 'center', slidesToScroll: 1 }}
        plugins={[plugin.current]}
        className="overflow-hidden"
      >
        <CarouselContent className="-ml-2 md:h-48 h-24">
          {slides.map((s) => (
            <CarouselItem key={s.id} className="pl-2 basis-[85%] md:basis-[70%] h-full" onClick="/event/{s.slug}">
              <Link href={`/event/${encodeURIComponent(s.slug ?? s.name)}`} className="relative block h-full bg-black">
                <img src={s.src} alt={s.alt ?? ""} className="relative object-cover h-full w-full" />
                <p className="absolute text-white bottom-0 left-0 bg-linear-to-t from-black to-transparent">#{s.name}</p>
              </Link>
            </CarouselItem>
          ))} 
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 
                        bg-black/60 text-white rounded-full w-12 h-12 
                        flex items-center justify-center transition">
          <ArrowLeft/>
        </CarouselPrevious>
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 
                        bg-black/60 text-white rounded-full w-12 h-12 
                        flex items-center justify-center transition">
          <ArrowRight/>
        </CarouselNext>
      </Carousel>
    </div>
  );
}
