import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://israelveiculos.com.br"),
  title: {
    default: "Israel Veículos - Carros Seminovos e Usados de Qualidade",
    template: "%s | Israel Veículos",
  },
  description:
    "Concessionária especializada em carros seminovos e usados com qualidade garantida. Mais de 15 anos de experiência no mercado automotivo. Financiamento facilitado e carros revisados.",
  keywords: [
    "carros usados",
    "carros seminovos",
    "concessionária",
    "veículos",
    "financiamento de carros",
    "carros de qualidade",
  ],
  authors: [{ name: "Israel Veículos" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://israelveiculos.com.br",
    siteName: "Israel Veículos",
    title: "Israel Veículos - Carros Seminovos e Usados de Qualidade",
    description:
      "Concessionária especializada em carros seminovos e usados com qualidade garantida. Mais de 15 anos de experiência no mercado automotivo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Israel Veículos - Carros Seminovos e Usados de Qualidade",
    description:
      "Concessionária especializada em carros seminovos e usados com qualidade garantida.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoDealer",
              name: "Israel Veículos",
              description:
                "Concessionária especializada em carros seminovos e usados de qualidade",
              url: "https://israelveiculos.com.br",
              telephone: "+55-XX-XXXXX-XXXX",
              address: {
                "@type": "PostalAddress",
                addressCountry: "BR",
                addressLocality: "Cidade",
                addressRegion: "Estado",
              },
              priceRange: "$$",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  opens: "08:00",
                  closes: "18:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Saturday",
                  opens: "08:00",
                  closes: "13:00",
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${sourceSans.variable} ${playfair.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
