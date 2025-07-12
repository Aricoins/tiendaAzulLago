'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/slices/cartSlice';

export default function SuccessPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        // Limpiar el carrito cuando el pago es exitoso
        dispatch(clearCart());
    }, [dispatch]);

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
