import { Resend } from 'resend';
import SaleNotificationEmail from '@/components/siteEmails/SaleNotificationEmail';

// Configuración de Resend (opcional)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Lista de emails de administradores que recibirán notificaciones
const ADMIN_NOTIFICATION_EMAILS = [
  'admin@azullago.com',
  'ariel@azullago.com',
  'administrador@azullago.com',
  'arielrogeldev@gmail.com',
  'azullagocoop@gmail.com', // Email agregado
];

interface SaleNotificationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  date: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export async function sendSaleNotification(saleData: SaleNotificationData) {
  try {
    console.log('📧 Enviando notificación de venta...', saleData.orderId);

    // Verificar si Resend está configurado
    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY no está configurada. Usando método alternativo...');
      return await sendSaleNotificationNodemailer(saleData);
    }

    // Preparar el contenido del email
    const emailContent = {
      from: 'Azul Lago Tienda <ventas@azullago.com>',
      to: ADMIN_NOTIFICATION_EMAILS,
      subject: `🎉 Nueva Venta #${saleData.orderId} - AR$ ${saleData.total.toLocaleString()}`,
      react: SaleNotificationEmail({ orderDetails: saleData }),
    };

    // Enviar email usando Resend
    const { data, error } = await resend.emails.send(emailContent);

    if (error) {
      console.error('❌ Error enviando notificación de venta:', error);
      throw error;
    }

    console.log('✅ Notificación de venta enviada exitosamente:', data?.id);
    return data;

  } catch (error) {
    console.error('❌ Error en sendSaleNotification:', error);
    throw error;
  }
}

// Función alternativa usando nodemailer (si prefieres no usar Resend)
export async function sendSaleNotificationNodemailer(saleData: SaleNotificationData) {
  try {
    const nodemailer = require('nodemailer');
    
    // Configurar transporter (usar tus credenciales SMTP)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generar HTML del email
    const emailHtml = generateSaleNotificationHTML(saleData);

    // Configurar email
    const mailOptions = {
      from: `"Azul Lago Tienda" <${process.env.SMTP_USER}>`,
      to: ADMIN_NOTIFICATION_EMAILS.join(','),
      subject: `🎉 Nueva Venta #${saleData.orderId} - AR$ ${saleData.total.toLocaleString()}`,
      html: emailHtml,
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Error enviando email con nodemailer:', error);
    throw error;
  }
}

// Función para generar HTML del email (para nodemailer)
function generateSaleNotificationHTML(saleData: SaleNotificationData): string {
  const { orderId, customerName, customerEmail, items, total, paymentMethod, date, shippingAddress } = saleData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nueva Venta - Azul Lago</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Nueva Venta Realizada</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Azul Lago - Tienda Online</p>
        </div>

        <!-- Content -->
        <div style="background-color: white; padding: 30px;">
          <!-- Order Summary -->
          <h2 style="color: #1f2937; margin-bottom: 15px;">📋 Resumen de la Venta</h2>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Número de Pedido:</strong> #${orderId}</p>
            <p><strong>Fecha:</strong> ${new Date(date).toLocaleDateString('es-AR')}</p>
            <p><strong>Total:</strong> <span style="color: #059669; font-size: 18px; font-weight: bold;">AR$ ${total.toLocaleString()}</span></p>
            <p><strong>Método de Pago:</strong> ${paymentMethod}</p>
          </div>

          <!-- Customer Info -->
          <h3 style="color: #1f2937; margin-bottom: 15px;">👤 Cliente</h3>
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
            <p><strong>Nombre:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            ${shippingAddress ? `
              <p><strong>Dirección:</strong> ${shippingAddress.street}, ${shippingAddress.city}</p>
            ` : ''}
          </div>

          <!-- Products -->
          <h3 style="color: #1f2937; margin-bottom: 15px;">🛍️ Productos</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Producto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">Cant.</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Precio</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">${item.name}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f3f4f6;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6;">AR$ ${item.price.toLocaleString()}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #f3f4f6; font-weight: bold;">AR$ ${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #f9fafb;">
                <td colspan="3" style="padding: 12px; font-weight: bold; text-align: right;">Total:</td>
                <td style="padding: 12px; font-weight: bold; text-align: right; color: #059669; font-size: 18px;">AR$ ${total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Actions -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://tienda.azullago.com/admindashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">Ver Dashboard</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
          <p>Azul Lago - Productos Naturales de Patagonia</p>
          <p><a href="https://tienda.azullago.com" style="color: #2563eb;">tienda.azullago.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Función para procesar y enviar notificación desde webhook o API
export async function processSaleNotification(orderData: any) {
  try {
    // Transformar datos del pedido al formato requerido
    const saleData: SaleNotificationData = {
      orderId: orderData.id || orderData.external_reference || Date.now().toString(),
      customerName: orderData.payer?.name || orderData.customer_name || 'Cliente',
      customerEmail: orderData.payer?.email || orderData.customer_email || 'No especificado',
      items: orderData.items?.map((item: any) => ({
        name: item.title || item.name,
        quantity: item.quantity || 1,
        price: item.unit_price || item.price || 0
      })) || [],
      total: orderData.transaction_amount || orderData.total || 0,
      paymentMethod: orderData.payment_method_id || orderData.payment_type || 'No especificado',
      date: orderData.date_created || orderData.created_at || new Date().toISOString(),
      shippingAddress: orderData.shipments?.[0]?.receiver_address ? {
        street: orderData.shipments[0].receiver_address.street_name,
        city: orderData.shipments[0].receiver_address.city_name,
        state: orderData.shipments[0].receiver_address.state_name,
        zipCode: orderData.shipments[0].receiver_address.zip_code
      } : undefined
    };

    // Enviar notificación
    await sendSaleNotification(saleData);
    
    console.log('✅ Notificación de venta procesada exitosamente');
    return { success: true };

  } catch (error) {
    console.error('❌ Error procesando notificación de venta:', error);
    throw error;
  }
}
