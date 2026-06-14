"use client";

import { useState } from "react";
import Image from "next/image";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrls } from "@/lib/image-url";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const imageUrls = getImageUrls(images);
  const [currentImage, setCurrentImage] = useState(0);

  const hasImages = imageUrls.length > 0;
  const canNavigate = imageUrls.length > 1;

  const nextImage = () => {
    setCurrentImage((current) => (current + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImage((current) =>
      current === 0 ? imageUrls.length - 1 : current - 1,
    );
  };

  if (!hasImages) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-secondary-100">
        <div className="text-center text-secondary-400">
          <Car className="mx-auto mb-3 h-16 w-16" />
          <span>Sem imagem disponível</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary-100">
        <Image
          src={imageUrls[currentImage]}
          alt={`${alt} - ${currentImage + 1}`}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 58vw, 100vw"
        />

        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white">
          {currentImage + 1} / {imageUrls.length}
        </div>

        {canNavigate && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-secondary-900 shadow transition hover:bg-white"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-secondary-900 shadow transition hover:bg-white"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {canNavigate && (
        <div className="grid grid-cols-5 gap-3">
          {imageUrls.slice(0, 10).map((image, index) => (
            <button
              type="button"
              key={image}
              onClick={() => setCurrentImage(index)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-secondary-100 transition ${
                currentImage === index
                  ? "border-primary"
                  : "border-transparent hover:border-secondary-300"
              }`}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${alt} miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="160px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
