import Link from 'next/link';

export default function FailurePage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-red-100">
            <h1 className="text-4xl font-bold text-red-800">¡Pago Fallido!</h1>
            <p className="text-xl mt-4">Lo sentimos, hubo un problema con tu pago. Intenta nuevamente.</p>
            <Link href="/cart" className="mt-8 text-blue-500 underline">
                Reintentar pago
            </Link>
        </div>
    );
}
