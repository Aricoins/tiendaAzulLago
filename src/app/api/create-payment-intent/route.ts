import mercadopago from 'mercadopago';
import { NextResponse, NextRequest } from "next/server";
import { sql } from "@vercel/postgres";

import { MercadoPagoConfig, Preference } from 'mercadopago';
// Agrega credenciales
const accessToken = process.env.MP_ACCESS_TOKEN || ""; // Set a default value if the environment variable is undefined
const client = new MercadoPagoConfig({ accessToken });

export async function POST(req: NextRequest) {
  const { itemsPrice , clientId} = await req.json();
  try {
   
const preference = new Preference(client);

preference.create({
  body: {
    items: [
      {id: clientId,
        title: 'Mi producto',
        quantity: 1,
        unit_price: 2000
      }
    ],
  }
})
.then(console.log)
.catch(console.log);


    return NextResponse.json({ preference });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function PUT(req: Request) {
  const { clientSecret, user_id, paymentid } = await req.json();

  try {
    const { rowCount } = await sql`
    UPDATE users
    SET clientsecret = ${clientSecret}, paymentid = ${paymentid}
    WHERE id = ${user_id}
    `;

    if (rowCount > 0) {
      return NextResponse.json({ message: `clientSecret updated ${clientSecret}, ${user_id}, ${paymentid}`, result: true });
    } else {
      return NextResponse.json({ message: `Failed to update clientSecret ${clientSecret}, ${user_id}`, result: false });
    }
  } catch (error: any) {
    return new NextResponse(error, {
      status: 400,
    });
  }
}
