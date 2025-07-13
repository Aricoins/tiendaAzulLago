import { NextRequest, NextResponse } from 'next/server';
import { sendSaleNotification } from '@/app/lib/sale-notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verificar que tenga datos mínimos
    if (!body.orderId || !body.total) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: orderId y total' },
        { status: 400 }
      );
    }

    // Datos de ejemplo o usar los proporcionados
    const saleData = {
      orderId: body.orderId || 'TEST-' + Date.now(),
      customerName: body.customerName || 'Cliente de Prueba',
      customerEmail: body.customerEmail || 'cliente@example.com',
      items: body.items || [
        {
          name: 'Aceite Esencial de Lavanda',
          quantity: 2,
          price: 2500
        },
        {
          name: 'Hidrolato de Rosas',
          quantity: 1,
          price: 1800
        }
      ],
      total: body.total || 6800,
      paymentMethod: body.paymentMethod || 'Tarjeta de Crédito',
      date: body.date || new Date().toISOString(),
      shippingAddress: body.shippingAddress || {
        street: 'Av. San Martín 123',
        city: 'Bariloche',
        state: 'Río Negro',
        zipCode: '8400'
      }
    };

    // Enviar notificación
    const result = await sendSaleNotification(saleData);

    return NextResponse.json({
      success: true,
      message: 'Notificación de venta enviada exitosamente',
      emailId: result?.id,
      data: saleData
    });

  } catch (error) {
    console.error('❌ Error enviando notificación de prueba:', error);
    return NextResponse.json(
      { 
        error: 'Error enviando notificación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de notificaciones de venta',
    usage: 'POST con datos de venta para enviar notificación',
    adminEmails: [
      'admin@azullago.com',
      'ariel@azullago.com', 
      'administrador@azullago.com',
      'arielrogeldev@gmail.com',
      'azullagocoop@gmail.com'
    ],
    example: {
      orderId: 'ORD-12345',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      total: 5000,
      items: [
        {
          name: 'Producto ejemplo',
          quantity: 1,
          price: 5000
        }
      ]
    }
  });
}
