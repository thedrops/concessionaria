"use client";

import { useState, useRef, DragEvent } from "react";
import { GripVertical, Trash2, Save, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface ImageItem {
  url: string;
  order: number;
}

interface ImageSorterProps {
  carId?: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  onRemoveImage: (index: number) => void;
}

export default function ImageSorter({
  carId,
  images,
  onImagesChange,
  onRemoveImage,
}: ImageSorterProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDraggingIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newImages = [...images];
      const draggedImage = newImages[dragItem.current];
      newImages.splice(dragItem.current, 1);
      newImages.splice(dragOverItem.current, 0, draggedImage);

      onImagesChange(newImages);
      setHasChanges(true);
    }

    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIndex(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const saveImageOrder = async () => {
    if (!carId) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Salve o carro primeiro antes de ordenar as imagens.",
      });
      return;
    }

    setSaving(true);

    try {
      const imageData: ImageItem[] = images.map((url, index) => ({
        url,
        order: index,
      }));

      const response = await fetch(`/api/cars/${carId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imageData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar ordem das imagens");
      }

      setHasChanges(false);

      await Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Ordem das imagens salva com sucesso.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao salvar ordem das imagens";

      Swal.fire({
        icon: "error",
        title: "Erro",
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Imagens do Veículo ({images.length})
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Arraste e solte para reordenar. A primeira imagem será a principal.
          </p>
        </div>
        {carId && hasChanges && (
          <button
            type="button"
            onClick={saveImageOrder}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Ordem
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            className={`relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 transition-all cursor-move ${
              draggingIndex === index
                ? "border-primary opacity-50 scale-95"
                : "border-transparent hover:border-primary"
            }`}
          >
            {/* Drag Handle */}
            <div className="absolute top-2 left-2 bg-white/90 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <GripVertical className="w-5 h-5 text-gray-600" />
            </div>

            {/* Image */}
            <img
              src={url}
              alt={`Imagem ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Overlay com botão de remover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  onRemoveImage(index);
                  setHasChanges(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                title="Remover imagem"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Badge de posição */}
            <div className="absolute top-2 right-2">
              {index === 0 ? (
                <div className="bg-primary text-white text-xs px-2 py-1 rounded font-semibold">
                  Principal
                </div>
              ) : (
                <div className="bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
                  #{index + 1}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!carId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Salve o carro primeiro para poder salvar a
            ordem das imagens. Por enquanto, você pode arrastar para organizar,
            mas a ordem só será persistida após salvar o carro.
          </p>
        </div>
      )}
    </div>
  );
}
