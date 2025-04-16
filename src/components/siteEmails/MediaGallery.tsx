'use client'

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Pagination } from 'swiper/modules';
import type SwiperType from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleSlideChange = (swiper: SwiperType) => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === swiper.activeIndex && media[swiper.activeIndex].type === 'video') {
        video.play();
      } else {
        video.pause();
      }
    });
  };

  return (
    <div className="w-[100%]">
      {/* Carrusel principal */}
      <Swiper
        modules={[Navigation, Thumbs, Pagination]}
        thumbs={{ swiper: thumbsSwiper }}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={1}
        onSlideChange={handleSlideChange}
        className="mb-4 h-96 w-full rounded-lg shadow-lg"
      >
        {media.map((item, index) => (
          <SwiperSlide key={index}>
            {item.type === 'video' ? (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}

                loop
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover rounded-lg bg-black"
              >
                <source src={item.url} type="video/mp4" />
                Tu navegador no soporta videos HTML5
              </video>
            ) : (
              <Image
                src={item.url}
                alt={`Imagen ${index + 1}`}
                width={800}
                height={600}
                className="h-full w-full object-cover rounded-lg"
                priority={index === 0}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Miniaturas */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        watchSlidesProgress
        modules={[Thumbs]}
        className="thumbs-swiper"
      >
        {media.map((item, index) => (
          <SwiperSlide key={index} className="!flex items-center justify-center cursor-pointer">
            <div className="relative aspect-square w-full overflow-hidden rounded-md border-2 border-transparent transition-all hover:border-blue-500">
              {item.type === 'video' ? (
                <>
                  <Image
                    src={item.thumbnail || item.url}
                    alt="Miniatura video"
                    width={100}
                    height={100}
                    className="h-full w-full object-cover brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </>
              ) : (
                <Image
                  src={item.url}
                  alt={`Miniatura ${index + 1}`}
                  width={100}
                  height={100}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}