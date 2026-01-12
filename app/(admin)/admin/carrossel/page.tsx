"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";

interface CarouselImage {
  id: string;
  image: string;
  title: string | null;
  link: string | null;
  order: number;
  active: boolean;
}

export default function CarrosselPage() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    link: "",
    active: true,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/admin/carousel");
      const data = await response.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar imagens:", error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingImage
        ? `/api/admin/carousel/${editingImage.id}`
        : "/api/admin/carousel";

      const method = editingImage ? "PUT" : "POST";

      const payload = editingImage
        ? { ...formData, order: editingImage.order }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchImages();
        closeModal();
      } else {
        alert("Erro ao salvar imagem");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar imagem");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      const response = await fetch(`/api/admin/carousel/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchImages();
      } else {
        alert("Erro ao excluir imagem");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir imagem");
    }
  };

  const handleToggleActive = async (image: CarouselImage) => {
    try {
      const response = await fetch(`/api/admin/carousel/${image.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...image, active: !image.active }),
      });

      if (response.ok) {
        await fetchImages();
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const handleChangeOrder = async (
    image: CarouselImage,
    direction: "up" | "down",
  ) => {
    const currentIndex = images.findIndex((img) => img.id === image.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [
      newImages[newIndex],
      newImages[currentIndex],
    ];

    // Atualizar ordens
    try {
      await Promise.all(
        newImages.map((img, index) =>
          fetch(`/api/admin/carousel/${img.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...img, order: index + 1 }),
          }),
        ),
      );

      await fetchImages();
    } catch (error) {
      console.error("Erro ao alterar ordem:", error);
    }
  };

  const openModal = (image?: CarouselImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        image: image.image,
        title: image.title || "",
        link: image.link || "",
        active: image.active,
      });
    } else {
      setEditingImage(null);
      setFormData({ image: "", title: "", link: "", active: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingImage(null);
    setFormData({ image: "", title: "", link: "", active: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", "carousel");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao fazer upload");
      }

      const data = await response.json();
      setFormData({ ...formData, image: data.url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Gerenciar Carrossel
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          <Plus className="w-5 h-5" />
          Nova Imagem
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Nenhuma imagem cadastrada no carrossel
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`bg-white rounded-lg shadow p-4 flex items-center gap-4 ${
                !image.active ? "opacity-50" : ""
              }`}
            >
              <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={image.image}
                  alt={image.title || "Carousel image"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {image.title || "(Sem título)"}
                </h3>
                {image.link && (
                  <p className="text-sm text-gray-500 truncate">{image.link}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Ordem: {image.order}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleChangeOrder(image, "up")}
                  disabled={index === 0}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                  title="Mover para cima"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleChangeOrder(image, "down")}
                  disabled={index === images.length - 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                  title="Mover para baixo"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleToggleActive(image)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  title={image.active ? "Desativar" : "Ativar"}
                >
                  {image.active ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => openModal(image)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Editar"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingImage ? "Editar Imagem" : "Nova Imagem"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload de Imagem *
                </label>
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Dimensão recomendada:</strong> 1920x600 pixels
                    (proporção 16:5)
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Para melhor visualização no carrossel, use imagens em
                    formato landscape (horizontal) com boa resolução.
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                />
                {uploadingImage && (
                  <p className="text-sm text-gray-500">Fazendo upload...</p>
                )}
                {formData.image && (
                  <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Ou insira a URL manualmente abaixo
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  placeholder="/uploads/carousel/imagem.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Título da imagem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (opcional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="/catalogo ou URL externa"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-gray-700"
                >
                  Ativo (visível no carrossel)
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  {editingImage ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
