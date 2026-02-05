"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Save, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const scriptSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  content: z.string().min(1, "Conteúdo do script é obrigatório"),
  position: z.enum(["HEAD", "BODY_START", "BODY_END"]),
  isActive: z.boolean(),
  description: z.string().optional(),
  order: z.number().min(0),
});

type ScriptFormData = z.infer<typeof scriptSchema>;

interface CustomScript {
  id: string;
  name: string;
  content: string;
  position: "HEAD" | "BODY_START" | "BODY_END";
  isActive: boolean;
  description: string | null;
  order: number;
}

interface ScriptFormProps {
  script: CustomScript | null;
  onClose: () => void;
  onSuccess: () => void;
}

const exampleScripts = [
  {
    name: "Google Tag Manager (Head)",
    position: "HEAD",
    content: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXX');</script>
<!-- End Google Tag Manager -->`,
  },
  {
    name: "Google Tag Manager (noscript)",
    position: "BODY_START",
    content: `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`,
  },
  {
    name: "Meta Pixel",
    position: "HEAD",
    content: `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->`,
  },
];

export default function ScriptForm({
  script,
  onClose,
  onSuccess,
}: ScriptFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ScriptFormData>({
    resolver: zodResolver(scriptSchema),
    defaultValues: {
      name: "",
      content: "",
      position: "HEAD",
      isActive: true,
      description: "",
      order: 0,
    },
  });

  const contentValue = watch("content");

  useEffect(() => {
    if (script) {
      reset({
        name: script.name,
        content: script.content,
        position: script.position,
        isActive: script.isActive,
        description: script.description || "",
        order: script.order,
      });
    }
  }, [script, reset]);

  const onSubmit = async (data: ScriptFormData) => {
    setIsSaving(true);

    try {
      const url = script ? `/api/scripts/${script.id}` : "/api/scripts";
      const method = script ? "PUT" : "POST";

      const payload = {
        ...data,
        description: data.description || null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Sucesso",
          text: script
            ? "Script atualizado com sucesso"
            : "Script criado com sucesso",
          timer: 1500,
          showConfirmButton: false,
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar script");
      }
    } catch (error: any) {
      console.error("Erro ao salvar script:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Erro ao salvar script",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadExample = (example: (typeof exampleScripts)[0]) => {
    setValue("name", example.name);
    setValue("content", example.content);
    setValue("position", example.position as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {script ? "Editar Script" : "Novo Script"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Exemplos de scripts */}
          {!script && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Exemplos rápidos (clique para preencher):
              </h3>
              <div className="flex flex-wrap gap-2">
                {exampleScripts.map((example, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadExample(example)}
                    className="text-xs bg-white border border-gray-200 px-3 py-1 rounded hover:bg-gray-100 transition"
                  >
                    {example.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Script *
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex: Google Tag Manager"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Posição e Ordem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posição *
              </label>
              <select
                {...register("position")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="HEAD">Head (dentro do &lt;head&gt;)</option>
                <option value="BODY_START">
                  Body Start (após abrir &lt;body&gt;)
                </option>
                <option value="BODY_END">
                  Body End (antes de fechar &lt;/body&gt;)
                </option>
              </select>
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.position.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordem de Carregamento
              </label>
              <input
                type="number"
                {...register("order", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Scripts com menor número são carregados primeiro
              </p>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descrição para identificação do script"
            />
          </div>

          {/* Conteúdo do Script */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Código do Script *
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Ocultar preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Ver preview
                  </>
                )}
              </button>
            </div>
            <textarea
              {...register("content")}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="Cole aqui o código do script (incluindo as tags <script>)"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">
                {errors.content.message}
              </p>
            )}

            {/* Preview */}
            {showPreview && contentValue && (
              <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg overflow-x-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {contentValue}
                </pre>
              </div>
            )}
          </div>

          {/* Ativo */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Script ativo (será renderizado nas páginas públicas)
            </label>
          </div>

          {/* Aviso de segurança */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Atenção:</strong> Certifique-se de que o código
              inserido é de fonte confiável. Scripts maliciosos podem
              comprometer a segurança do site e dos usuários.
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {script ? "Atualizar" : "Criar"} Script
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
