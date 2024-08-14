import { sql } from "@vercel/postgres";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  try {
    // Asegúrate de que el email esté presente
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const { rows: users } = await sql`SELECT * FROM users WHERE email = ${email}`;

    // Verifica si se encontró un usuario
    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user_id = users[0].id;

    const { rows: cartItems } = await sql`
      SELECT * FROM cart_items WHERE user_id = ${user_id};
    `;

    return NextResponse.json({ cartItems, users });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return NextResponse.json({ message: 'Error fetching cart items' }, { status: 500 });
  }
}

  
export async function POST(req: Request) {
  const { productId, model, image, price, qty, email } = await req.json();

  try {
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const { rows: users } = await sql`SELECT id FROM users WHERE email=${email}`;
    
    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user_id = users[0].id;

    const { rowCount } = await sql`
      INSERT INTO cart_items (user_id, product_id, name, image, price, qty)
      VALUES (${user_id}, ${productId}, ${model}, ${image}, ${price}, ${qty})
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET qty = cart_items.qty + ${qty};
    `;

    if (rowCount > 0) {
      return NextResponse.json({ message: "Added item to cart", result: true });
    } else {
      return NextResponse.json({ message: "Failed to add", result: false });
    }
  } catch (e) {
    console.error('Error adding item to cart:', e);
    return NextResponse.json({ message: "Failed to add", result: false });
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
      return NextResponse.json({ message: "Item Deleted", result: true });
    } else {
      return NextResponse.json({ message: "Failed to delete", result: false });
    }
  } catch (e) {
    console.error('Error deleting item from cart:', e);
    return NextResponse.json({ message: "Failed to delete", result: false });
  }
}


export async function PUT(req: Request) {
  const { cart_item_id, qty } = await req.json();

  if (!cart_item_id || qty == null) {
    return NextResponse.json({ message: 'cart_item_id and qty are required' }, { status: 400 });
  }

  try {
    const { rowCount } = await sql`
      UPDATE cart_items
      SET qty = ${qty}
      WHERE cart_item_id = ${cart_item_id}
    `;

    if (rowCount > 0) {
      return NextResponse.json({ message: "Quantity Updated", result: true });
    } else {
      return NextResponse.json({ message: "Failed to update quantity", result: false });
    }
  } catch (e) {
    console.error('Error updating quantity:', e);
    return NextResponse.json({ message: "Failed to update quantity", result: false });
  }
}
