"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";

const settingsSchema = z.object({
  whatsappNumber: z.string().min(10, "Número inválido"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  companyEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  companyAddress: z.string().optional(),
  facebookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    } else {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    // Salva apenas os números no formulário, com código do país
    const cleaned = formatted.replace(/\D/g, "");
    setValue("whatsappNumber", `55${cleaned}`);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();

      if (response.ok) {
        reset({
          whatsappNumber: data.whatsappNumber,
          companyName: data.companyName,
          companyEmail: data.companyEmail || "",
          companyAddress: data.companyAddress || "",
          facebookUrl: data.facebookUrl || "",
          instagramUrl: data.instagramUrl || "",
        });

        // Formatar telefone para exibição (remover código do país 55)
        const phoneWithoutCountry = data.whatsappNumber.replace(/^55/, "");
        setPhone(formatPhone(phoneWithoutCountry));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao carregar configurações",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);

    try {
      const payload = {
        ...data,
        companyEmail: data.companyEmail || null,
        companyAddress: data.companyAddress || null,
        facebookUrl: data.facebookUrl || null,
        instagramUrl: data.instagramUrl || null,
      };

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Configurações salvas!",
          text: "As configurações foram atualizadas com sucesso.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao salvar configurações";
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">
          Gerencie as configurações gerais do site
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção WhatsApp */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              WhatsApp
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do WhatsApp
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              {errors.whatsappNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.whatsappNumber.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Este número será usado no botão &quot;Tenho Interesse&quot;
              </p>
            </div>
          </div>

          {/* Seção Empresa */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações da Empresa
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  {...register("companyName")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Israel Veículos"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email da Empresa
                </label>
                <input
                  {...register("companyEmail")}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contato@empresa.com"
                />
                {errors.companyEmail && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companyEmail.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <textarea
                  {...register("companyAddress")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, número, bairro, cidade - estado"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Seção Redes Sociais */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Redes Sociais
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  {...register("facebookUrl")}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://facebook.com/sua-pagina"
                />
                {errors.facebookUrl && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.facebookUrl.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  {...register("instagramUrl")}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://instagram.com/seu-perfil"
                />
                {errors.instagramUrl && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.instagramUrl.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
