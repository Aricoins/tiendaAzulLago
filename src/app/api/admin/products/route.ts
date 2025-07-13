import { sql } from "@vercel/postgres";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const product = await req.json();
    
    const {
      model,
      category,
      specs,
      image,
      price,
      video,
      disable = false
    } = product;

    // Validaciones básicas
    if (!model || !category || !image || !price) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos: model, category, image, price' },
        { status: 400 }
      );
    }

    // Insertar producto
    const { rows } = await sql`
      INSERT INTO products (model, category, specs, image, price, video, disable)
      VALUES (
        ${model},
        ${category},
        ${JSON.stringify(specs)},
        ${image},
        ${parseFloat(price)},
        ${video || null},
        ${disable}
      )
      RETURNING *
    `;

    return NextResponse.json({
      message: "Producto creado exitosamente",
      product: rows[0]
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Error al crear producto', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Obtener todos los productos (para el admin)
export async function GET(req: NextRequest) {
  try {
    const { rows } = await sql`
      SELECT * FROM products ORDER BY created_at DESC
    `;

    return NextResponse.json({ products: rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
