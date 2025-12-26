"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<number>>(
    new Set(Array.from({ length: images.length }, (_, i) => i)),
  );

  const openImage = (index: number) => {
    setSelectedImage(index);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeImage();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  const handleImageLoad = (index: number) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.length > 0 ? (
          <>
            <div
              className="relative h-96 bg-secondary-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
              onClick={() => openImage(0)}
            >
              {loadingImages.has(0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary-100 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              )}
              <Image
                src={images[0]}
                alt={`${alt} - 1`}
                fill
                className="object-cover"
                onLoad={() => handleImageLoad(0)}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="relative h-44 bg-secondary-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                    onClick={() => openImage(index + 1)}
                  >
                    {loadingImages.has(index + 1) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-secondary-100 z-10">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                      </div>
                    )}
                    <Image
                      src={image}
                      alt={`${alt} - ${index + 2}`}
                      fill
                      className="object-cover"
                      onLoad={() => handleImageLoad(index + 1)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-96 bg-secondary-200 rounded-lg">
            <span className="text-secondary-400">Sem imagem disponível</span>
          </div>
        )}
      </div>

      {/* Modal de imagem expandida */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeImage}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Botão fechar */}
          <button
            onClick={closeImage}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
            aria-label="Fechar"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Botão anterior */}
          {selectedImage > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition z-10"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-12 w-12" />
            </button>
          )}

          {/* Imagem */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingImages.has(selectedImage) && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            )}
            <Image
              src={images[selectedImage]}
              alt={`${alt} - ${selectedImage + 1}`}
              fill
              className="object-contain"
              onLoad={() => handleImageLoad(selectedImage)}
            />
          </div>

          {/* Botão próximo */}
          {selectedImage < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition z-10"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-12 w-12" />
            </button>
          )}

          {/* Contador de imagens */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
