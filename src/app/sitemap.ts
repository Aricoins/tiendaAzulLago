import { sql } from '@vercel/postgres';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: 'https://tienda.azullago.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://tienda.azullago.com/product',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: 'https://tienda.azullago.com/cart',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
    {
      url: 'https://tienda.azullago.com/form',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic product pages
  try {
    const { rows: products } = await sql.query(
      'SELECT id, model, category, price FROM products WHERE disable = false ORDER BY id'
    );

    const productPages = products.map((product: any) => ({
      url: `https://tienda.azullago.com/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Category pages
    const categories = [...new Set(products.map((p: any) => p.category))];
    const categoryPages = categories.map((category) => ({
      url: `https://tienda.azullago.com/product?category=${encodeURIComponent(category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
