"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Code,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Swal from "sweetalert2";
import ScriptForm from "@/components/admin/ScriptForm";

interface CustomScript {
  id: string;
  name: string;
  content: string;
  position: "HEAD" | "BODY_START" | "BODY_END";
  isActive: boolean;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const positionLabels: Record<string, string> = {
  HEAD: "Head (dentro do <head>)",
  BODY_START: "Body Start (após abrir <body>)",
  BODY_END: "Body End (antes de fechar </body>)",
};

const positionColors: Record<string, string> = {
  HEAD: "bg-blue-100 text-blue-800",
  BODY_START: "bg-green-100 text-green-800",
  BODY_END: "bg-purple-100 text-purple-800",
};

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<CustomScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingScript, setEditingScript] = useState<CustomScript | null>(null);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      const response = await fetch("/api/scripts?admin=true");
      const data = await response.json();
      if (response.ok) {
        setScripts(data);
      }
    } catch (error) {
      console.error("Erro ao carregar scripts:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao carregar scripts",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (script: CustomScript) => {
    try {
      const response = await fetch(`/api/scripts/${script.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !script.isActive }),
      });

      if (response.ok) {
        setScripts((prev) =>
          prev.map((s) =>
            s.id === script.id ? { ...s, isActive: !s.isActive } : s,
          ),
        );
        Swal.fire({
          icon: "success",
          title: "Sucesso",
          text: `Script ${!script.isActive ? "ativado" : "desativado"} com sucesso`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar script:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao atualizar script",
      });
    }
  };

  const handleDelete = async (script: CustomScript) => {
    const result = await Swal.fire({
      title: "Confirmar exclusão",
      text: `Deseja realmente excluir o script "${script.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/scripts/${script.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setScripts((prev) => prev.filter((s) => s.id !== script.id));
          Swal.fire({
            icon: "success",
            title: "Excluído",
            text: "Script excluído com sucesso",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Erro ao excluir script:", error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Erro ao excluir script",
        });
      }
    }
  };

  const handleEdit = (script: CustomScript) => {
    setEditingScript(script);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingScript(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadScripts();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Scripts Personalizados
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie scripts como Google Tag Manager, Meta Pixel, popups e
            outros
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          <Plus className="w-5 h-5" />
          Novo Script
        </button>
      </div>

      {/* Informações sobre posições */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Onde os scripts serão inseridos:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            <strong>HEAD:</strong> Dentro da tag &lt;head&gt; - ideal para
            Google Tag Manager, Meta Pixel, Analytics
          </li>
          <li>
            <strong>BODY START:</strong> Logo após abrir &lt;body&gt; - ideal
            para noscript do GTM
          </li>
          <li>
            <strong>BODY END:</strong> Antes de fechar &lt;/body&gt; - ideal
            para chat widgets, popups
          </li>
        </ul>
      </div>

      {scripts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Nenhum script cadastrado
          </h3>
          <p className="text-gray-500 mb-4">
            Adicione scripts personalizados para integrar ferramentas de análise
            e marketing
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
          >
            <Plus className="w-5 h-5" />
            Adicionar Script
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scripts.map((script) => (
                <tr key={script.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {script.name}
                      </div>
                      {script.description && (
                        <div className="text-sm text-gray-500">
                          {script.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${positionColors[script.position]}`}
                    >
                      {script.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {script.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(script)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                        script.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {script.isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Inativo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(script)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(script)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal do Formulário */}
      {showForm && (
        <ScriptForm
          script={editingScript}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
