import { sql } from '@vercel/postgres';
import { Products } from '../lib/definitions';
import Image from 'next/image';
import Link from 'next/link';
import OrderButtons from '@/components/orderButtons';
import { AddToCart } from '@/components/AddToCart';
import FilterbyPriceRange from '@/components/filterPriceRange';
import AverageRatingStars from '@/components/RatingReview/AverageRating';
import { Suspense } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import type { Metadata } from 'next';
export const fetchCache = 'force-no-store';

interface SearchParams {
  model: string;
  category?: string;
  ordByPrice: string;
  minPrice: string;
  maxPrice: string;
}

// Generate SEO metadata based on search parameters
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category, model } = searchParams;
  
  let title = 'Productos - Azul Lago';
  let description = 'Descubí nuestra colección completa de productos naturales y orgánicos. Aceites esenciales, hidrolatos y cosméticos de Patagonia.';
  
  if (category) {
    title = `${category} - Productos Naturales | Azul Lago`;
    description = `Explorá nuestra línea de ${category.toLowerCase()} naturales y orgánicos. Productos premium de Patagonia con envío rápido.`;
  }
  
  if (model) {
    title = `Resultados para "${model}" | Azul Lago`;
    description = `Encontrá ${model} y productos relacionados en Azul Lago. Calidad premium, ingredientes naturales.`;
  }

  const keywords = [
    'productos naturales',
    'patagonia',
    'orgánico',
    'aceites esenciales',
    'hidrolatos',
    'cosméticos naturales',
    'azul lago',
    'argentina'
  ];

  if (category) {
    keywords.unshift(category.toLowerCase());
  }

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: category 
        ? `https://tienda.azullago.com/product?category=${encodeURIComponent(category)}`
        : 'https://tienda.azullago.com/product',
    },
    alternates: {
      canonical: category 
        ? `https://tienda.azullago.com/product?category=${encodeURIComponent(category)}`
        : 'https://tienda.azullago.com/product',
    },
  };
}

// JSON-LD for Product Listing
function ProductListingStructuredData({ products, category }: { products: Products[], category?: string }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": category ? `${category} - Azul Lago` : "Productos - Azul Lago",
    "description": category 
      ? `Productos de ${category} naturales y orgánicos`
      : "Catálogo completo de productos naturales",
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.model,
        "image": product.image,
        "category": product.category,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "ARS",
          "availability": "https://schema.org/InStock"
        },
        "url": `https://tienda.azullago.com/product/${product.id}`
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

async function fetchData(searchParams: SearchParams) {
  let data;
  let query = 'SELECT * FROM products WHERE disable = false';
  const values: any[] = [];

  if (searchParams.category) {
    // Agregar variación con y sin "s" en la categoría
    query += ' AND (category = $1 OR category = $2)';
    values.push(searchParams.category, searchParams.category.replace(/s$/, ''));
  }

  // Apply price range filter if provided
  if (searchParams.minPrice && searchParams.maxPrice) {
    query += ' AND price BETWEEN $3 AND $4';
    values.push(parseInt(searchParams.minPrice), parseInt(searchParams.maxPrice));
  }

  query += ' ORDER BY price';

  try {
    data = await sql.query(query, values);
    return data.rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Product({ searchParams }: { searchParams: SearchParams }) {
  const data = await fetchData(searchParams);

  return (
    <>
      <ProductListingStructuredData products={data} category={searchParams.category} />
      <main className="flex flex-wrap flex-col content-center items-start mx-5 my-[10%]">
        <Suspense fallback={
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <ClipLoader color="blue" size={150} aria-label="Loading Spinner" data-testid="loader" />
          </div>
        }>
        <div className='w-full inline-flex justify-between mb-4'>
          {/* Mostrar categoría actual y enlace para limpiar filtros */}
          {searchParams.category &&
            <div className='flex gap-2 h-12 items-center border-gray-400 border bg-transparent rounded-md'>
              <h2 className='text-gray-400'>Categoría: {searchParams.category}</h2>
              <Link href='/product'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="red" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          }
          <FilterbyPriceRange />
          <OrderButtons />
        </div>

        {/* Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center my-8">
          {data.length ? (
            data.map((product: Products) => (
              <div key={product.id} className="flex flex-col items-center border border-gray-300 rounded-md m-2 hover:border-blue-600 bg-white p-4 shadow-lg">
                <Link href={`/product/${product.id}`} className="w-full">
                  <div className="flex justify-center">
                    {/* Mostrar video o imagen según el producto */}
                    {product.video ? (
                      <video
                        src={product.video}
                        width={200}
                        height={200}
                        autoPlay
                        loop
                        className="rounded-lg my-5 mx-auto hover:shadow-xl"
                      />
                    ) : (
                      <Image
                        className="hover:shadow-xl my-5 mx-auto rounded-lg"
                        src={product.image}
                        width={200}
                        height={200}
                        alt={product.model}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold text-black">{product.model}</p>
                    <p className="bg-blue-600 text-white py-1 px-3 rounded-2xl text-sm font-semibold my-2">
                      ${product.price} AR$
                    </p>
                  </div>
                </Link>
                <AddToCart
                  buttonStyle="p-2 text-sm w-36"
                  stock={0}
                  productId={product.id}
                  showQty={false}
                  product={product}
                  increasePerClick={true}
                  redirect={false}
                />
              </div>
            ))
          ) : (
            <div className="w-full text-center mt-10">
              <h1 className="text-xl font-bold">No se encontraron productos.</h1>
              <Link href='/product' className="underline text-blue-400 mt-4">Ver todos los productos</Link>
            </div>
          )}
        </div>
      </Suspense>
    </main>
    </>
  );
}
