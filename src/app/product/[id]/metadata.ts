import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';

interface Product {
  id: string;
  model: string;
  category: string;
  specs: Record<string, any>;
  image: string;
  price: string;
  video?: string;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const result = await sql.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return null;
  }
}

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
  
  // Extract benefits from specs for description
  const benefits = product.specs?.beneficios || product.specs?.usos || '';
  const enhancedDescription = benefits ? 
    `${productDescription} ${benefits}` : productDescription;

  return {
    title: productTitle,
    description: enhancedDescription.slice(0, 160), // Optimal meta description length
    keywords: [
      product.model.toLowerCase(),
      product.category.toLowerCase(),
      'patagonia',
      'orgánico',
      'natural',
      'azul lago',
      'argentina',
      'aceites esenciales',
      'hidrolatos'
    ],
    openGraph: {
      title: productTitle,
      description: enhancedDescription.slice(0, 160),
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.model,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: productTitle,
      description: enhancedDescription.slice(0, 160),
      images: [product.image],
    },
    alternates: {
      canonical: `https://tienda.azullago.com/product/${params.id}`,
    },
  };
}
