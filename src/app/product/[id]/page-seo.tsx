import { sql } from '@vercel/postgres';
import Image from "next/image";
import { AddToCart } from "@/components/AddToCart";
import MediaGallery from "@/components/siteEmails/MediaGallery";
import { Products } from "@/app/lib/definitions";
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface Detail {
  id: string;
  model: string;
  category: string;
  specs: Record<string, any>;
  image: string;
  colors: string;
  price: string;
  carrusel: Record<string, string>;
  video: string;
  website: string;
}

async function getProduct(id: string): Promise<Detail | null> {
  try {
    const result = await sql.query('SELECT * FROM products WHERE id = $1 AND disable = false', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Server-side metadata generation for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  if (!product) {
    return {
      title: 'Producto no encontrado | Azul Lago',
      description: 'El producto que buscas no está disponible.',
    };
  }

  const productTitle = `${product.model} - ${product.category}`;
  const productDescription = `Comprá ${product.model} en Azul Lago. ${product.category} de calidad premium. Precio: AR$ ${product.price}. Envío rápido en Argentina.`;
  
  // Extract benefits from specs for enhanced description
  const benefits = product.specs?.beneficios || product.specs?.usos || '';
  const enhancedDescription = benefits ? 
    `${productDescription} ${benefits}`.slice(0, 160) : productDescription.slice(0, 160);

  return {
    title: productTitle,
    description: enhancedDescription,
    keywords: [
      product.model.toLowerCase(),
      product.category.toLowerCase(),
      'patagonia',
      'orgánico',
      'natural',
      'azul lago',
      'argentina',
      'aceites esenciales',
      'hidrolatos',
      'cosméticos naturales'
    ],
    openGraph: {
      title: productTitle,
      description: enhancedDescription,
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.model,
        },
      ],
      type: 'website',
      url: `https://tienda.azullago.com/product/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: productTitle,
      description: enhancedDescription,
      images: [product.image],
    },
    alternates: {
      canonical: `https://tienda.azullago.com/product/${params.id}`,
    },
  };
}

// JSON-LD Structured Data Component
function ProductStructuredData({ product }: { product: Detail }) {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.model,
    "image": product.image,
    "description": product.specs?.beneficios || `${product.model} - ${product.category} de calidad premium`,
    "brand": {
      "@type": "Brand",
      "name": "Azul Lago"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": `https://tienda.azullago.com/product/${product.id}`,
      "priceCurrency": "ARS",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Azul Lago"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Breadcrumb Component for SEO
function Breadcrumbs({ product }: { product: Detail }) {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://tienda.azullago.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Productos",
        "item": "https://tienda.azullago.com/product"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.category,
        "item": `https://tienda.azullago.com/product?category=${encodeURIComponent(product.category)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.model,
        "item": `https://tienda.azullago.com/product/${product.id}`
      }
    ]
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li><a href="/" className="hover:text-blue-600">Inicio</a></li>
          <li className="before:content-['/'] before:mx-2">
            <a href="/product" className="hover:text-blue-600">Productos</a>
          </li>
          <li className="before:content-['/'] before:mx-2">
            <a href={`/product?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-600">
              {product.category}
            </a>
          </li>
          <li className="before:content-['/'] before:mx-2 text-gray-400">
            {product.model}
          </li>
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
    </>
  );
}

export default async function Detail({ params }: { params: { id: string } }) {
  const productDetail = await getProduct(params.id);
  
  if (!productDetail) {
    notFound();
  }

  function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  
  function formatKey(key: string) {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Prepare media for gallery
  const media: MediaItem[] = [];

  if (productDetail.video) {
    media.push({
      type: 'video',
      url: productDetail.video,
      thumbnail: productDetail.image,
    });
  }
  
  media.push({
    type: 'image',
    url: productDetail.image,
  });
  
  if (productDetail.carrusel) {
    Object.values(productDetail.carrusel).forEach((url) => {
      media.push({
        type: 'image',
        url: typeof url === 'string' ? url : String(url),
      });
    });
  }

  return (
    <>
      <ProductStructuredData product={productDetail} />
      <main className="container mx-auto p-4">
        <Breadcrumbs product={productDetail} />
        
        <section className="flex flex-col gap-2 rounded-lg border border-white border-4 bg-gray-rgb(144,144, 144) p-6 md:flex-row">
          {/* Image and Video Section */}
          <div className="flex flex-col items-center md:w-1/2">
            <MediaGallery media={media} />

            {/* Image Carousel */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {productDetail.carrusel &&
                Object.entries(productDetail.carrusel).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-md p-1 border border-gray-300"
                  >
                    <Image
                      src={value}
                      alt={`${productDetail.model} - ${key}`}
                      width={60}
                      height={60}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col gap-4 text-white md:w-1/2">
            <h1 className="text-3xl font-bold md:text-4xl">{productDetail.model}</h1>
            <h2 className="text-lg font-medium">{productDetail.category}</h2>

            <div className="rounded-lg bg-blue-600 px-4 py-2 text-xl font-semibold text-center">
              AR$ {productDetail.price}
            </div>

            {/* Specifications */}
            <div>
              <h3 className="mt-6 text-2xl font-bold">Características:</h3>
              <ul className="mt-2 space-y-2 break-words">
                {productDetail.specs &&
                  Object.entries(productDetail.specs).map(([key, value]) => (
                    <li
                      key={key}
                      className="flex flex-col md:flex-row md:items-start md:gap-2"
                    >
                      <span className="font-bold bg-blue-600 text-gray-100">{formatKey(key)}:</span>
                      <span className="md:whitespace-normal break-words">
                        {String(value).toLowerCase()}
                      </span>
                    </li>
                  ))}
              </ul>

              <AddToCart
                buttonStyle="px-6 py-2 mt-4 text-base border border-white rounded-full"
                stock={40}
                productId={productDetail.id}
                showQty={false}
                product={{
                  id: productDetail.id,
                  model: productDetail.model,
                  category: productDetail.category,
                  specs: productDetail.specs,
                  image: productDetail.image,
                  colors: productDetail.colors ? [productDetail.colors] : [],
                  price: parseFloat(productDetail.price),
                  carrusel: productDetail.carrusel,
                  video: productDetail.video,
                  website: productDetail.website,
                } as Products}
                increasePerClick={true}
                redirect={false}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
