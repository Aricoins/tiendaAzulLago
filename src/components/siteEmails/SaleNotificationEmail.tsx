import React from 'react';

interface SaleNotificationEmailProps {
  orderDetails: {
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
  };
}

const SaleNotificationEmail: React.FC<SaleNotificationEmailProps> = ({ orderDetails }) => {
  const {
    orderId,
    customerName,
    customerEmail,
    items,
    total,
    paymentMethod,
    date,
    shippingAddress
  } = orderDetails;

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🎉 Nueva Venta Realizada</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px' }}>Azul Lago - Tienda Online</p>
      </div>

      {/* Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '0 0 10px 10px'
      }}>
        {/* Order Summary */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#1f2937', marginBottom: '15px' }}>📋 Resumen de la Venta</h2>
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p><strong>Número de Pedido:</strong> #{orderId}</p>
            <p><strong>Fecha:</strong> {new Date(date).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Total:</strong> <span style={{ color: '#059669', fontSize: '18px', fontWeight: 'bold' }}>AR$ {total.toLocaleString()}</span></p>
            <p><strong>Método de Pago:</strong> {paymentMethod}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>👤 Información del Cliente</h3>
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '15px',
            borderRadius: '8px',
            borderLeft: '4px solid #2563eb'
          }}>
            <p><strong>Nombre:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
            {shippingAddress && (
              <>
                <p><strong>Dirección de Envío:</strong></p>
                <p style={{ marginLeft: '20px', color: '#6b7280' }}>
                  {shippingAddress.street}<br/>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Products */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>🛍️ Productos Vendidos</h3>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Producto</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Cantidad</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Precio</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>{item.name}</td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>AR$ {item.price.toLocaleString()}</td>
                    <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold' }}>
                      AR$ {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <td colSpan={3} style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>Total:</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right', color: '#059669', fontSize: '18px' }}>
                    AR$ {total.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a href={`https://tienda.azullago.com/admindashboard`} style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-block',
            marginRight: '10px'
          }}>
            Ver Dashboard
          </a>
          <a href={`https://tienda.azullago.com/orders/${orderId}`} style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-block'
          }}>
            Ver Pedido Completo
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '20px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <p>Este es un email automático de notificación de venta</p>
        <p>Azul Lago - Productos Naturales de Patagonia</p>
        <p>
          <a href="https://tienda.azullago.com" style={{ color: '#2563eb' }}>tienda.azullago.com</a> | 
          <a href="https://www.azullago.com" style={{ color: '#2563eb' }}> azullago.com</a>
        </p>
      </div>
    </div>
  );
};

export default SaleNotificationEmail;
