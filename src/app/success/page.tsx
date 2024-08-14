import Link from 'next/link';

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-green-100">
            <h1 className="text-4xl font-bold text-green-800">¡Pago Exitoso!</h1>
            <p className="text-xl mt-4">Gracias por tu compra. Tu pago ha sido procesado exitosamente.</p>
            <Link href="/" className="mt-8 text-blue-500 underline">
               Volver al inicio
            </Link>
        </div>
    );
}
