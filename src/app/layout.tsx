import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/NavBar";
import { Suspense } from "react";
import { ClerkProvider, RedirectToSignIn, SignedOut } from "@clerk/nextjs";
import { StoreProvider } from "@/redux/storeProvider";
import CartSideBar from "@/components/CartSideBar";
import App from "@/components/App";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

// Configuración SEO Principal
export const metadata: Metadata = {
  title: {
    template: '%s | Azul Lago',
    default: 'Azul Lago - Tienda Oficial',
  },
  description: 'Descubre nuestra colección exclusiva de productos. Envíos rápidos y garantía de calidad.',
  keywords: ['patagonia', 'organico', 'aceites esenciales', 'hidrolatos', 'lago', 'azul'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.azullago.com',
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
  metadataBase: new URL('https://www.azullago.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es"> {/* Cambiado a español */}
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