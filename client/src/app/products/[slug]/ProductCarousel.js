"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export default function ProductCarousel({
  images,
  productName,
  showSaleBadge,
}) {
  const [emblaMainApi, setEmblaMainApi] = useState(null);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const autoplayRef = useRef(null);

  const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const startAutoplay = useCallback(() => {
    if (!emblaMainApi || autoplayRef.current) return;

    setIsAutoScrolling(true);
    autoplayRef.current = setInterval(() => {
      if (!emblaMainApi.canScrollNext()) {
        emblaMainApi.scrollTo(0);
      } else {
        emblaMainApi.scrollNext();
      }
    }, 4000);
  }, [emblaMainApi]);

  const stopAutoplay = useCallback(() => {
    if (!autoplayRef.current) return;

    setIsAutoScrolling(false);
    clearInterval(autoplayRef.current);
    autoplayRef.current = null;
  }, []);

  const toggleAutoplay = useCallback(() => {
    if (isAutoScrolling) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }, [isAutoScrolling, startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (!emblaMainApi) return;

    if (isAutoScrolling) {
      startAutoplay();
    }

    return () => stopAutoplay();
  }, [emblaMainApi, isAutoScrolling, startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (!emblaMainApi) return;

    const onSelect = () => {
      const selectedIndex = emblaMainApi.selectedScrollSnap();
      setSelectedSlide(selectedIndex);
    };

    emblaMainApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaMainApi.off("select", onSelect);
    };
  }, [emblaMainApi]);

  useEffect(() => {
    if (!emblaThumbsApi || !emblaMainApi) return;

    emblaThumbsApi.scrollTo(selectedSlide);
  }, [emblaThumbsApi, emblaMainApi, selectedSlide]);

  const onThumbClick = useCallback(
    (index) => {
      if (!emblaMainApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi]
  );

  const scrollThumbnails = useCallback(
    (direction) => {
      if (!emblaThumbsApi) return;

      if (direction === "prev") {
        emblaThumbsApi.scrollPrev();
      } else {
        emblaThumbsApi.scrollNext();
      }
    },
    [emblaThumbsApi]
  );

  if (!images || images.length === 0) {
    return (
      <div className="relative h-[500px] w-full bg-gray-50 flex items-center justify-center rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-8">
        <Image
          src="/product-placeholder.jpg"
          alt={productName}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden mb-8 shadow-sm border border-gray-200">
      {/* Main Carousel */}
      <Carousel
        opts={{
          loop: true,
          align: "start",
          dragFree: false,
        }}
        className="relative"
        orientation="horizontal"
        setApi={setEmblaMainApi}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[500px] w-full bg-gray-50 transition-all duration-300">
                <Image
                  src={image.url || "/product-placeholder.jpg"}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
                {showSaleBadge && index === 0 && (
                  <div className="absolute top-6 left-6 bg-[#F47C20] text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
                    SALE
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div
          className="absolute inset-0"
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
        />

        <CarouselPrevious className="left-4 h-12 w-12 bg-white/90 hover:bg-white border-2 border-[#F47C20] text-[#F47C20] hover:text-[#F47C20] shadow-lg z-10" />
        <CarouselNext className="right-4 h-12 w-12 bg-white/90 hover:bg-white border-2 border-[#F47C20] text-[#F47C20] hover:text-[#F47C20] shadow-lg z-10" />

        <button
          onClick={toggleAutoplay}
          className="absolute bottom-6 right-6 h-10 w-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center z-10 shadow-lg border border-gray-200"
          aria-label={isAutoScrolling ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoScrolling ? (
            <Pause className="h-4 w-4 text-[#F47C20]" />
          ) : (
            <Play className="h-4 w-4 text-[#F47C20]" />
          )}
        </button>
      </Carousel>

      {/* Thumbnail Carousel */}
      {images.length > 1 && (
        <div className="p-6 bg-gray-50 border-t border-gray-200 relative">
          <div
            className={`overflow-hidden ${images.length > 5 ? "px-10" : ""}`}
          >
            <div className="embla-thumbs" ref={thumbViewportRef}>
              <div className="flex space-x-4 py-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border-3 transition-all hover:shadow-md ${
                      selectedSlide === index
                        ? "border-[#F47C20] shadow-lg"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => onThumbClick(index)}
                  >
                    <div className="relative w-24 h-24">
                      <Image
                        src={image.url || "/product-placeholder.jpg"}
                        alt={`${productName} - Thumbnail ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    </div>
                    {selectedSlide === index && (
                      <div className="absolute inset-0 bg-[#F47C20]/10 rounded-lg"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {images.length > 5 && (
            <>
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-white hover:bg-gray-50 shadow-lg rounded-full z-10 border-2 border-[#F47C20] text-[#F47C20]"
                onClick={() => scrollThumbnails("prev")}
                aria-label="View previous thumbnails"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center bg-white hover:bg-gray-50 shadow-lg rounded-full z-10 border-2 border-[#F47C20] text-[#F47C20]"
                onClick={() => scrollThumbnails("next")}
                aria-label="View next thumbnails"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
