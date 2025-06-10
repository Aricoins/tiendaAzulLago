import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/NavBar";
import { Suspense } from "react";
import { ClerkProvider, RedirectToSignIn, SignedOut } from "@clerk/nextjs";
import { StoreProvider } from "@/redux/storeProvider";
import CartSideBar from "@/components/CartSideBar";
import App from "@/components/App";
import { Analytics } from "@vercel/analytics/next";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

// Configuración SEO Principal
export const metadata: Metadata = {
  title: {
    template: '%s | Azul Lago',
    default: 'Azul Lago - Tienda Oficial',
  },
  description: 'Descubí nuestra colección exclusiva de productos. Envíos rápidos y garantía de calidad.',
  keywords: ['patagonia', 'orgánico', 'aceites esenciales', 'hidrolatos', 'lago', 'azul'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.tienda.azullago.com',
    siteName: 'Azul Lago',
    images: [
      {
        url: 'https://tienda.azullago.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdx0htqhaq%2Fimage%2Fupload%2Fv1734016225%2Fi8n5b9n7gu314ygzfs31.jpg&w=1920&q=75',
        width: 1200,
        height: 630,
        alt: 'Azul Lago Tienda Oficial',
      },
    ],
  },
  metadataBase: new URL('https://www.tienda.azullago.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });`}
        </Script>
      </head>
      <body className={inter.className}>
        <ClerkProvider>
          <StoreProvider>
            <App>{children}</App>
            <Analytics />
          </StoreProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}