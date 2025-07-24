
import { ThreeItemGrid } from '@/components/grid/threeItemGrid';
import { Carousel } from '@/components/Carousel';
import { Suspense } from 'react';
import Purchases from '@/components/purchases/Purchases';
import type { Metadata } from 'next';
export const fetchCache = 'force-no-store';

// SEO específico para la página de inicio
export const metadata: Metadata = {
  title: 'Inicio',
  description: 'Bienvenido a Azul Lago - Tu tienda de productos naturales y orgánicos de Patagonia. Aceites esenciales, hidrolatos y cosméticos premium con ingredientes 100% naturales.',
  openGraph: {
    title: 'Azul Lago - Productos Naturales de Patagonia',
    description: 'Descubrí aceites esenciales, hidrolatos y cosméticos naturales premium de Patagonia.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tienda.azullago.com',
  },
};

// Structured Data para la organización
function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Azul Lago",
    "url": "https://tienda.azullago.com",
    "logo": "https://tienda.azullago.com/img/azulago.png",
    "description": "Tienda especializada en productos naturales y orgánicos de Patagonia",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR",
      "addressRegion": "Patagonia"
    },
    "sameAs": [
      "https://www.azullago.com"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Productos Naturales",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Aceites Esenciales",
          "itemListElement": []
        },
        {
          "@type": "OfferCatalog", 
          "name": "Hidrolatos",
          "itemListElement": []
        },
        {
          "@type": "OfferCatalog",
          "name": "Cosméticas",
          "itemListElement": []
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function Home() {
  return (
    <>
      <OrganizationStructuredData />
      <main className="flex flex-col items-center justify-between">
        <section aria-label="Productos destacados">
          <ThreeItemGrid/> 
        </section>
        <section aria-label="Catálogo de productos">
          <Suspense>
            <Carousel/>
          </Suspense>
        </section>
      </main>
    </>
  )
}

