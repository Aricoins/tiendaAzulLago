// SEO Configuration for Azul Lago Ecommerce
export const SEO_CONFIG = {
  siteName: 'Azul Lago',
  siteUrl: 'https://tienda.azullago.com',
  defaultTitle: 'Azul Lago - Productos Naturales y Orgánicos de Patagonia',
  defaultDescription: 'Descubrí nuestra colección exclusiva de aceites esenciales, hidrolatos y cosméticos naturales de Patagonia. Productos orgánicos premium con envío rápido en Argentina.',
  
  // Keywords principales por categoría
  categoryKeywords: {
    'Aceites Esenciales': [
      'aceites esenciales patagonia',
      'aceites naturales argentina',
      'aromaterapia natural',
      'aceites puros orgánicos'
    ],
    'Hidrolatos': [
      'hidrolatos patagonia',
      'aguas florales naturales',
      'hidrolatos orgánicos argentina',
      'destilados florales'
    ],
    'Cosméticas': [
      'cosméticos naturales patagonia',
      'cosmética orgánica argentina',
      'productos belleza natural',
      'cremas naturales'
    ],
    'Medicinales': [
      'productos medicinales naturales',
      'medicina natural patagonia',
      'remedios naturales orgánicos',
      'fitoterapia argentina'
    ]
  },

  // Keywords globales
  globalKeywords: [
    'patagonia',
    'orgánico',
    'natural',
    'azul lago',
    'argentina',
    'sustentable',
    'wellness',
    'bienestar natural'
  ],

  // Configuración de redes sociales
  social: {
    twitter: '@azullago',
    facebook: 'azullagooficial',
    instagram: '@azul.lago'
  },

  // Configuración de Open Graph
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    images: {
      default: '/img/azulago.png',
      width: 1200,
      height: 630
    }
  },

  // Configuración de JSON-LD
  organization: {
    name: 'Azul Lago',
    url: 'https://tienda.azullago.com',
    logo: 'https://tienda.azullago.com/img/azulago.png',
    address: {
      country: 'AR',
      region: 'Patagonia'
    }
  }
};

// Función para generar keywords específicos de producto
export function generateProductKeywords(product: {
  model: string;
  category: string;
  specs?: Record<string, any>;
}): string[] {
  const baseKeywords = [
    product.model.toLowerCase(),
    product.category.toLowerCase(),
    ...SEO_CONFIG.globalKeywords
  ];

  // Agregar keywords específicos de categoría
  const categoryKeys = SEO_CONFIG.categoryKeywords[product.category as keyof typeof SEO_CONFIG.categoryKeywords] || [];
  
  // Extraer ingredientes si existen
  const ingredients = product.specs?.ingredientes || '';
  const ingredientKeywords = ingredients ? 
    ingredients.split(',').slice(0, 3).map((ing: string) => ing.trim().toLowerCase()) : [];

  return [
    ...baseKeywords,
    ...categoryKeys,
    ...ingredientKeywords
  ].filter(Boolean);
}

// Función para generar descripciones meta optimizadas
export function generateMetaDescription(product: {
  model: string;
  category: string;
  price: string;
  specs?: Record<string, any>;
}): string {
  const benefits = product.specs?.beneficios || product.specs?.usos || '';
  
  let description = `Comprá ${product.model} en Azul Lago. ${product.category} natural de Patagonia. Precio: AR$ ${product.price}.`;
  
  if (benefits) {
    description += ` ${benefits.slice(0, 50)}...`;
  }
  
  description += ' Envío rápido en Argentina.';
  
  return description.slice(0, 160); // Longitud óptima para meta description
}
