import { sql } from "@vercel/postgres";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const { rows: products } = await sql`
      SELECT id, model, price, disable 
      FROM products 
      WHERE id = ${id}
    `;

    if (products.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    if (product.disable) {
      return NextResponse.json({ 
        available: 0, 
        message: 'Product is disabled' 
      }, { status: 200 });
    }

    // For now, return a default stock of 40
    // In the future, you can implement real stock management
    const available = 40;

    return NextResponse.json({ 
      available,
      product_id: id,
      product_name: product.model,
      price: product.price
    });

  } catch (error) {
    console.error('Error checking stock:', error);
    return NextResponse.json(
      { message: 'Error checking stock', error: error.message },
      { status: 500 }
    );
  }
}
