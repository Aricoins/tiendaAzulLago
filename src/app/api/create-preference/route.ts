import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import "dotenv/config"

// Configura MercadoPago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: NextRequest) {
  try {
    const datos = await req.json();    
    if (!datos.items || !Array.isArray(datos.items) || datos.items.length === 0) {
      return NextResponse.json({ message: 'items needed', error: 'invalid_items', status: 400, cause: null });
    }

    const preferenceData = {
      
        body: {
          payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
},
          items: [
            {
              title: datos.name,
              quantity: 1,
              unit_price: 2000
            }
          ],
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
