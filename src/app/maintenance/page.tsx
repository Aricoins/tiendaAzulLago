import Image from 'next/image';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <Image
            src="/img/azulago.png"
            alt="Azul Lago"
            width={200}
            height={200}
            className="mx-auto mb-6"
          />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Volveremos pronto
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Estamos Trabajando para Vos
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Nuestra tienda se encuentra temporalmente cerrada mientras completamos 
            las mejoras necesarias para ofrecerte los productos 
            con todas las garantías de calidad.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Estamos trabajando para reabrir lo antes posible. Te agradecemos tu paciencia 
            y comprensión durante este proceso.
          </p>
        </div>
        
        <div className="bg-blue-600 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">¿Tenés consultas?</h3>
          <p className="mb-4">
            Podés contactarnos para cualquier información adicional
          </p>
        </div>
        
        <div className="mt-8 text-gray-500">
          <p className="text-sm">© 2024 Azul Lago - Productos Patagónicos</p>
        </div>
      </div>
    </div>
  );
}
