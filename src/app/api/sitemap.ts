import { NextApiRequest, NextApiResponse } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tienda.azullago.com";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const staticPages = ["/", "/about", "/products", "/contact"];

  const fetchDynamicPages = async () => {
    const response = await fetch(`${baseUrl}/api/products`);
    if (response.ok) {
      const products = await response.json();
      return products.map((product: { id: string }) => `/product/${product.id}`);
    }
    return [];
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