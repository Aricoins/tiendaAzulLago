import { NextRequest, NextResponse } from 'next/server';
import { processSaleNotification } from '@/app/lib/sale-notifications';

export async function POST(req: NextRequest) {
  try {
    console.log('🔔 Webhook de venta recibido');
    
    // Obtener el cuerpo de la solicitud
    const body = await req.json();
    console.log('📦 Datos del webhook:', body);

    // Verificar que sea una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (paymentId) {
        console.log('💳 Procesando pago ID:', paymentId);
        
        // Aquí puedes hacer una llamada adicional a la API de MercadoPago 
        // para obtener detalles completos del pago si es necesario
        try {
          // Obtener token de acceso de MercadoPago
          const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
          
          if (accessToken) {
            // Obtener detalles del pago desde MercadoPago
            const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            });
            
            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              console.log('💰 Datos completos del pago:', paymentData);
              
              // Verificar que el pago fue aprobado
              if (paymentData.status === 'approved') {
                console.log('✅ Pago aprobado, enviando notificación...');
                
                // Procesar y enviar notificación de venta
                await processSaleNotification(paymentData);
                
                return NextResponse.json({ 
                  success: true, 
                  message: 'Notificación de venta enviada exitosamente' 
                });
              } else {
                console.log('⏳ Pago no aprobado, status:', paymentData.status);
                return NextResponse.json({ 
                  success: false, 
                  message: 'Pago no aprobado' 
                });
              }
            }
          }
        } catch (error) {
          console.error('❌ Error obteniendo detalles del pago:', error);
        }
      }
    }

    // Si llegamos aquí, procesamos con los datos del webhook directamente
    if (body.status === 'approved' || body.transaction_amount) {
      console.log('📧 Enviando notificación con datos del webhook...');
      await processSaleNotification(body);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error en webhook de ventas:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' }, 
      { status: 500 }
    );
  }
}

// También aceptar GET para verificación
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook de ventas activo',
    timestamp: new Date().toISOString()
  });
}
