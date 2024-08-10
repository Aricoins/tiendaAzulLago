import Link from 'next/link';

export default function PendingPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-yellow-100">
            <h1 className="text-4xl font-bold text-yellow-800">Pago Pendiente</h1>
            <p className="text-xl mt-4">Tu pago está en proceso. Te notificaremos cuando se complete.</p>
            <Link href="/" className="mt-8 text-blue-500 underline">Volver al inicio
            </Link>
        </div>
    );
}
