import { sql } from "@vercel/postgres";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    
    let query = 'SELECT * FROM products';
    const values: any[] = [];
    let paramIndex = 1;
    
    const conditions = [];
    
    if (category && category !== 'all') {
      conditions.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }
    
    if (active === 'true') {
      conditions.push(`disable = false`);
    } else if (active === 'false') {
      conditions.push(`disable = true`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { rows: products } = await sql.query(query, values);
    
    return NextResponse.json({
      products,
      count: products.length
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error al obtener productos', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

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

export async function PUT(req: NextRequest) {
  try {
    const { id, disable } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID es requerido' },
        { status: 400 }
      );
    }
    
    const { rowCount } = await sql`
      UPDATE products
      SET disable = ${disable}
      WHERE id = ${id}
    `;
    
    if (rowCount > 0) {
      return NextResponse.json({ 
        message: "Producto actualizado exitosamente", 
        result: true 
      });
    } else {
      return NextResponse.json({ 
        message: "Producto no encontrado", 
        result: false 
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Error al actualizar producto', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
