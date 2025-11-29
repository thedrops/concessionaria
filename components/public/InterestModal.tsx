"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Send } from "lucide-react";
import { Car } from "@prisma/client/wasm";

const leadSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface InterestModalProps {
  car: Car;
}

export default function InterestModal({ car }: InterestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          carId: car.id,
        }),
      });

      if (response.ok) {
        // Redirect to WhatsApp
        const message = encodeURIComponent(
          `Olá! Tenho interesse no veículo ${car.brand} ${car.model} (${car.year}). Meu nome é ${data.name}.`,
        );
        const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
        window.location.href = whatsappUrl;

        reset();
        setIsOpen(false);
      } else {
        alert("Erro ao enviar mensagem. Tente novamente.");
      }
    } catch (error) {
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition inline-flex items-center"
      >
        <Send className="mr-2 h-6 w-6" />
        Tenho Interesse
      </button>
    );
  }

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Manifestar Interesse
          </h2>
          <p className="text-secondary-600 mb-6">
            {car.brand} {car.model} ({car.year})
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Nome Completo
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Seu nome"
              />
              {errors.name && (
                <p className="text-accent-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-accent-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Telefone
              </label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-accent-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-secondary-300 text-white font-bold py-3 px-6 rounded-md transition"
            >
              {isSubmitting ? "Enviando..." : "Enviar e Continuar no WhatsApp"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
