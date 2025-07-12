import { sql } from "@vercel/postgres";
import { NextResponse, NextRequest } from "next/server";

// Improved error handling
const handleError = (error: any, operation: string) => {
  console.error(`Error during ${operation}:`, error);
  return NextResponse.json(
    { message: `Error during ${operation}`, error: error.message },
    { status: 500 }
  );
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  try {
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const { rows: users } = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user_id = users[0].id;

    const { rows: cartItems } = await sql`
      SELECT 
        ci.*,
        p.model as name,
        p.image,
        p.price as current_price,
        p.disable as product_disabled
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ${user_id} AND p.disable = false;
    `;

    return NextResponse.json({ cartItems, users });
  } catch (error) {
    return handleError(error, 'fetching cart items');
  }
}

  
export async function POST(req: Request) {
  const { productId, model, image, price, qty, email } = await req.json();

  try {
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    if (!productId || !model || !price || !qty) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { rows: users } = await sql`SELECT id FROM users WHERE email=${email}`;
    
    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user_id = users[0].id;

    // Check if product exists and is available
    const { rows: products } = await sql`
      SELECT id, model, price, disable FROM products 
      WHERE id = ${productId} AND disable = false
    `;

    if (products.length === 0) {
      return NextResponse.json({ message: 'Product not found or disabled' }, { status: 404 });
    }

    const { rowCount } = await sql`
      INSERT INTO cart_items (user_id, product_id, name, image, price, qty)
      VALUES (${user_id}, ${productId}, ${model}, ${image}, ${price}, ${qty})
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET qty = cart_items.qty + ${qty}, updated_at = CURRENT_TIMESTAMP;
    `;

    if (rowCount > 0) {
      return NextResponse.json({ message: "Added item to cart", result: true });
    } else {
      return NextResponse.json({ message: "Failed to add", result: false });
    }
  } catch (error) {
    return handleError(error, 'adding item to cart');
  }
}


export async function DELETE(req: Request) {
  const { cart_item_id } = await req.json();

  if (!cart_item_id) {
    return NextResponse.json({ message: 'cart_item_id is required' }, { status: 400 });
  }

  try {
    const { rowCount } = await sql`DELETE FROM cart_items WHERE cart_item_id = ${cart_item_id}`;

    if (rowCount > 0) {
      return NextResponse.json({ message: "Item deleted successfully", result: true });
    } else {
      return NextResponse.json({ message: "Item not found", result: false }, { status: 404 });
    }
  } catch (error) {
    return handleError(error, 'deleting item from cart');
  }
}

export async function PUT(req: Request) {
  const { cart_item_id, qty } = await req.json();

  if (!cart_item_id || qty == null) {
    return NextResponse.json({ message: 'cart_item_id and qty are required' }, { status: 400 });
  }

  if (qty < 1) {
    return NextResponse.json({ message: 'Quantity must be at least 1' }, { status: 400 });
  }

  try {
    const { rowCount } = await sql`
      UPDATE cart_items
      SET qty = ${qty}, updated_at = CURRENT_TIMESTAMP
      WHERE cart_item_id = ${cart_item_id}
    `;

    if (rowCount > 0) {
      return NextResponse.json({ message: "Quantity updated successfully", result: true });
    } else {
      return NextResponse.json({ message: "Item not found", result: false }, { status: 404 });
    }
  } catch (error) {
    return handleError(error, 'updating quantity');
  }
}
