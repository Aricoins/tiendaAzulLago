import { NextApiRequest, NextApiResponse } from "next";

let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tienda.azullago.com";

// Ensure baseUrl has protocol
if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  baseUrl = `https://${baseUrl}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const staticPages = ["/", "/about", "/products", "/contact"];

  const fetchDynamicPages = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/products`);
      if (response.ok) {
        const products = await response.json();
        return products.map((product: { id: string }) => `/product/${product.id}`);
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const dynamicPages = await fetchDynamicPages();
  const urls = [...staticPages, ...dynamicPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls
        .map(
          (url) => `
        <url>
          <loc>${baseUrl}${url}</loc>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>`
        )
        .join("")}
    </urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(sitemap);
  res.end();
}