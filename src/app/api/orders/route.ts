import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      preference_id,
      payer,
      total_amount,
      items,
    } = body;

    // Crear la orden
    const {
      rows: orderRows,
    } = await sql`
      INSERT INTO orders (
        preference_id,
        email,
        name,
        surname,
        dni,
        phone,
        address,
        total_amount,
        status
      )
      VALUES (
        ${preference_id},
        ${payer.email},
        ${payer.name},
        ${payer.surname},
        ${payer.dni},
        ${payer.phone},
        ${payer.address},
        ${total_amount},
        'pending'
      )
      RETURNING id
    `;
    console.log("Datos recibidos:", { payer });
    const orderId = orderRows[0].id;

    // Insertar ítems
    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id,
          product_id,
          title,
          quantity,
          unit_price
        )
        VALUES (
          ${orderId},
          ${item.product_id},
          ${item.title},
          ${item.quantity},
          ${item.unit_price}
        )
      `;
    }
    console.log("Datos recibidos:", { payer });
    return NextResponse.json({ message: "Orden registrada", orderId });
  } catch (error) {
    console.error("Error creando orden:", error);
    return NextResponse.json(
      { message: "Error creando orden" },
      { status: 500 }
    );
  }
}
