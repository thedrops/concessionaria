import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import CustomScripts from "@/components/public/CustomScripts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Concessionária - Encontre seu carro ideal",
  description: "A melhor concessionária de carros da região",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <Suspense fallback={null}>
          <CustomScripts position="HEAD" />
        </Suspense>
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <CustomScripts position="BODY_START" />
        </Suspense>
        {children}
        <Suspense fallback={null}>
          <CustomScripts position="BODY_END" />
        </Suspense>
      </body>
    </html>
  );
}
