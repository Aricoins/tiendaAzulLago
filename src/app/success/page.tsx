'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '@/redux/slices/cartSlice';
import { RootState } from '@/redux/store';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);
    const [notificationSent, setNotificationSent] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const sendSaleNotification = async () => {
            // Solo enviar si hay items en el carrito y no se ha enviado ya
            if (cartItems.length > 0 && !notificationSent) {
                try {
                    const paymentId = searchParams.get('payment_id');
                    const status = searchParams.get('status');
                    const merchantOrderId = searchParams.get('merchant_order_id');

                    if (status === 'approved') {
                        // Calcular total del carrito
                        const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

                        // Preparar datos de la venta
                        const saleData = {
                            orderId: paymentId || merchantOrderId || 'ORD-' + Date.now(),
                            customerName: 'Cliente', // Podrías obtener esto del formulario
                            customerEmail: 'cliente@example.com', // Podrías obtener esto del formulario
                            items: cartItems.map(item => ({
                                name: item.name,
                                quantity: item.qty,
                                price: item.price
                            })),
                            total: total,
                            paymentMethod: 'MercadoPago',
                            date: new Date().toISOString()
                        };

                        // Enviar notificación
                        const response = await fetch('/api/test-sale-notification', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(saleData),
                        });

                        if (response.ok) {
                            console.log('✅ Notificación de venta enviada exitosamente');
                            setNotificationSent(true);
                        } else {
                            console.error('❌ Error enviando notificación de venta');
                        }
                    }
                } catch (error) {
                    console.error('❌ Error enviando notificación:', error);
                }
            }
        };

        // Enviar notificación
        sendSaleNotification();

        // Limpiar el carrito después de un delay para permitir que se envíe la notificación
        const timer = setTimeout(() => {
            dispatch(clearCart());
        }, 2000);

        return () => clearTimeout(timer);
    }, [dispatch, cartItems, notificationSent, searchParams]);

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-green-100">
            <h1 className="text-4xl font-bold text-green-800">¡Pago Exitoso!</h1>
            <p className="text-xl mt-4">Gracias por tu compra. Tu pago ha sido procesado exitosamente.</p>
            <p className="text-lg mt-2 text-gray-700">
                Recibirás un email con los detalles de tu compra.
            </p>
            <Link href="/" className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
               Volver al inicio
            </Link>
        </div>
    );
}
