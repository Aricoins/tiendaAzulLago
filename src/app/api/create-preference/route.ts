import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configura MercadoPago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: NextRequest) {
  try {
    const datos = await req.json();    
    if (!datos.items || !Array.isArray(datos.items) || datos.items.length === 0) {
      return NextResponse.json({ message: 'items needed', error: 'invalid_items', status: 400, cause: null });
    }
console.log(datos, "datos de la request")
    const preferenceData = {
      body: {
        items: datos.items,
        payer: datos.payer,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`,
        },
        auto_return: datos.auto_return || 'approved',
        payment_methods: datos.payment_methods,
        notification_url: datos.notification_url,
        statement_descriptor: datos.statement_descriptor,
        external_reference: datos.external_reference,
        expires: datos.expires,
        expiration_date_from: datos.expiration_date_from,
        expiration_date_to: datos.expiration_date_to,
      }
    };

    // Crear la preferencia de pago
    const preference = new Preference(client);

    const createdPreference = await preference.create(preferenceData);


    // Enviar solo el ID de la preferencia
    return NextResponse.json({ preferenceId: createdPreference.id });
  } catch (error) {
    console.error('Error al crear la preferencia:', error);
    return NextResponse.json({ message: 'Error creando la preferencia', error }, { status: 500 });
  }
}
