import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe. Explorá nuestros productos naturales de Patagonia.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-blue-600 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Volver al inicio
          </Link>
          
          <Link 
            href="/product"
            className="block w-full border border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Ver productos
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            ¿Necesitás ayuda? Explorá nuestras categorías:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              href="/product?category=Aceites Esenciales"
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              Aceites Esenciales
            </Link>
            <Link 
              href="/product?category=Hidrolatos"
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              Hidrolatos
            </Link>
            <Link 
              href="/product?category=Cosméticas"
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              Cosméticas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
