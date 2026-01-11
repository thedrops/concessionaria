"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search, X, Upload, Trash2 } from "lucide-react";

const carSchema = z.object({
  brand: z.string().min(2, "Marca deve ter no mínimo 2 caracteres"),
  model: z.string().min(2, "Modelo deve ter no mínimo 2 caracteres"),
  year: z.string().min(4, "Ano inválido"),
  modelYear: z.string().optional(),
  version: z.string().optional(),
  transmission: z.string().optional(),
  doors: z.coerce.number().int().positive().optional(),
  fuel: z.string().optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  plate: z.string().optional(),
  color: z.string().optional(),
  passengers: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  optionals: z.string().optional(),
  additionalInfo: z.string().optional(),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  images: z.string().optional(),
  status: z.enum(["AVAILABLE", "SOLD"]),
  consignado: z.boolean().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

interface CarFormProps {
  car?: {
    id: string;
    brand: string;
    model: string;
    year: string;
    modelYear: string | null;
    version: string | null;
    transmission: string | null;
    doors: number | null;
    fuel: string | null;
    mileage: number | null;
    plate: string | null;
    color: string | null;
    passengers: number | null;
    price: number;
    optionals: string | null;
    additionalInfo: string | null;
    description: string;
    images: string[];
    status: string;
    consignado: boolean;
  };
}

export default function CarForm({ car }: CarFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useApi, setUseApi] = useState(false);
  const [plate, setPlate] = useState("");
  const [searchingPlate, setSearchingPlate] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    car?.images || [],
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: car
      ? {
          brand: car.brand,
          model: car.model,
          year: car.year,
          modelYear: car.modelYear || "",
          version: car.version || "",
          transmission: car.transmission || "",
          doors: car.doors || undefined,
          fuel: car.fuel || "",
          mileage: car.mileage || undefined,
          plate: car.plate || "",
          color: car.color || "",
          passengers: car.passengers || undefined,
          price: car.price,
          optionals: car.optionals || "",
          additionalInfo: car.additionalInfo || "",
          description: car.description,
          images: car.images.join("\n"),
          status: car.status as "AVAILABLE" | "SOLD",
          consignado: car.consignado,
        }
      : {
          status: "AVAILABLE",
          consignado: false,
        },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erro ao fazer upload");
        }

        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      const newImages = [...uploadedImages, ...urls];
      setUploadedImages(newImages);
      setValue("images", newImages.join("\n"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer upload das imagens",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue("images", newImages.join("\n"));
  };

  const searchByPlate = async () => {
    if (!plate || plate.length < 7) {
      setError("Placa inválida");
      return;
    }

    setSearchingPlate(true);
    setError("");

    try {
      const response = await fetch(`/api/cars/search-plate?plate=${plate}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar dados da placa");
      }

      // Preencher formulário com dados da API
      if (data.brand) setValue("brand", data.brand);
      if (data.model) setValue("model", data.model);
      if (data.year) setValue("year", data.year);
      if (data.version) setValue("version", data.version);
      if (data.transmission) setValue("transmission", data.transmission);
      if (data.doors) setValue("doors", data.doors);
      if (data.fuel) setValue("fuel", data.fuel);
      if (data.color) setValue("color", data.color);
      setValue("plate", plate);

      setUseApi(false); // Fechar o modal de busca
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar placa");
    } finally {
      setSearchingPlate(false);
    }
  };

  const onSubmit = async (data: CarFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const url = car ? `/api/cars/${car.id}` : "/api/cars";
      const method = car ? "PUT" : "POST";

      // Converter imagens de texto para array
      const imagesArray = data.images
        ? data.images
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : [];

      const payload = {
        ...data,
        images: imagesArray,
        modelYear: data.modelYear || null,
        version: data.version || null,
        transmission: data.transmission || null,
        doors: data.doors || null,
        fuel: data.fuel || null,
        mileage: data.mileage || null,
        plate: data.plate || null,
        color: data.color || null,
        passengers: data.passengers || null,
        optionals: data.optionals || null,
        additionalInfo: data.additionalInfo || null,
        consignado: data.consignado || false,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar carro");
      }

      router.push("/admin/carros");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar carro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Search Option */}
      {!car && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Buscar dados pela placa
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Utilize nossa API para preencher automaticamente os dados do veículo
          </p>
          <button
            type="button"
            onClick={() => setUseApi(!useApi)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {useApi ? "Preencher manualmente" : "Buscar pela placa"}
          </button>
        </div>
      )}

      {/* Plate Search Modal */}
      {useApi && (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Buscar veículo pela placa
            </h3>
            <button
              type="button"
              onClick={() => setUseApi(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="ABC-1234 ou ABC1D34"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
              maxLength={8}
            />
            <button
              type="button"
              onClick={searchByPlate}
              disabled={searchingPlate || plate.length < 7}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searchingPlate ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && !useApi && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        {/* Informações Básicas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Marca *
              </label>
              <input
                {...register("brand")}
                type="text"
                id="brand"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Toyota"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.brand.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Modelo *
              </label>
              <input
                {...register("model")}
                type="text"
                id="model"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Corolla"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.model.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ano Fabricação *
              </label>
              <input
                {...register("year")}
                type="text"
                id="year"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="2024"
                maxLength={4}
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.year.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="modelYear"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ano Modelo
              </label>
              <input
                {...register("modelYear")}
                type="text"
                id="modelYear"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="2025"
                maxLength={4}
              />
            </div>

            <div>
              <label
                htmlFor="version"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Versão
              </label>
              <input
                {...register("version")}
                type="text"
                id="version"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="XEi 2.0"
              />
            </div>

            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cor
              </label>
              <input
                {...register("color")}
                type="text"
                id="color"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Prata"
              />
            </div>

            <div>
              <label
                htmlFor="plate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Placa
              </label>
              <input
                {...register("plate")}
                type="text"
                id="plate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                placeholder="ABC-1234"
                maxLength={8}
              />
            </div>
          </div>
        </div>

        {/* Especificações Técnicas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Especificações Técnicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="transmission"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Câmbio
              </label>
              <select
                {...register("transmission")}
                id="transmission"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecione</option>
                <option value="Manual">Manual</option>
                <option value="Automático">Automático</option>
                <option value="Automatizado">Automatizado</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="doors"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Portas
              </label>
              <input
                {...register("doors")}
                type="number"
                id="doors"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="4"
                min="2"
                max="5"
              />
            </div>

            <div>
              <label
                htmlFor="fuel"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Combustível
              </label>
              <select
                {...register("fuel")}
                id="fuel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecione</option>
                <option value="Flex">Flex</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
                <option value="Elétrico">Elétrico</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="mileage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Quilometragem
              </label>
              <input
                {...register("mileage")}
                type="number"
                id="mileage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="50000"
                min="0"
              />
            </div>

            <div>
              <label
                htmlFor="passengers"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Passageiros
              </label>
              <input
                {...register("passengers")}
                type="number"
                id="passengers"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="5"
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Preço e Status */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Preço e Disponibilidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Preço (R$) *
              </label>
              <input
                {...register("price")}
                type="number"
                id="price"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="75000.00"
                min="0"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status *
              </label>
              <select
                {...register("status")}
                id="status"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="AVAILABLE">Disponível</option>
                <option value="SOLD">Vendido</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                {...register("consignado")}
                type="checkbox"
                id="consignado"
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label
                htmlFor="consignado"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Veículo Consignado
              </label>
            </div>
          </div>
        </div>

        {/* Opcionais */}
        <div>
          <label
            htmlFor="optionals"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Opcionais
          </label>
          <textarea
            {...register("optionals")}
            id="optionals"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ar condicionado, Direção elétrica, Vidros elétricos, etc."
          />
          <p className="mt-1 text-sm text-gray-500">
            Liste os opcionais do veículo separados por vírgula
          </p>
        </div>

        {/* Descrição */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Descrição *
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Descrição detalhada do veículo..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Informações Adicionais */}
        <div>
          <label
            htmlFor="additionalInfo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Informações Adicionais
          </label>
          <textarea
            {...register("additionalInfo")}
            id="additionalInfo"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Observações importantes, histórico, etc."
          />
        </div>

        {/* Imagens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagens do Veículo
          </label>

          {/* Image Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Fazendo upload...</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Clique para fazer upload das imagens
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG ou WebP (máx. 5MB por arquivo)
                  </p>
                </>
              )}
            </label>
          </div>

          {/* Image Preview Grid */}
          {uploadedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                      title="Remover imagem"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Hidden input for form submission */}
          <input type="hidden" {...register("images")} />

          <p className="mt-2 text-sm text-gray-500">
            A primeira imagem será a imagem principal do veículo
          </p>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>{car ? "Atualizar Carro" : "Cadastrar Carro"}</>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
