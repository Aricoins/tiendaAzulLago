'use client';

import QuickAddProduct from '@/components/admin/QuickAddProduct';
import { useUser } from '@clerk/nextjs';

export default function QuickAdminPage() {
  const { user } = useUser();

  // Simple verificación de admin (puedes mejorar esto)
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'admin@azullago.com' || 
                  user?.primaryEmailAddress?.emailAddress?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Panel de Administración Rápido</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario para agregar productos */}
          <div>
            <QuickAddProduct />
          </div>
          
          {/* Instrucciones rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">🚀 Métodos Rápidos</h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">1. Usar este formulario</h4>
                <p className="text-sm text-gray-600">
                  Llena el formulario de la izquierda para agregar productos uno por uno
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">2. Editar products.json</h4>
                <p className="text-sm text-gray-600">
                  Edita <code>src/app/lib/products.json</code> y ejecuta <code>npm run seed</code>
                </p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold">3. API Direct</h4>
                <p className="text-sm text-gray-600">
                  POST a <code>/api/admin/products</code> con los datos del producto
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Formato de producto:</h4>
              <pre className="text-xs mt-2 bg-blue-100 p-2 rounded">
{`{
  "model": "Nombre del Producto",
  "category": "Medicinales|Cosméticas|Aromáticas",
  "price": "15000",
  "image": "URL_de_imagen",
  "video": "URL_de_video",
  "specs": {
    "beneficios": "...",
    "ingredientes": "...",
    "presentacion": "..."
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
