const { db } = require('@vercel/postgres');

// Productos específicos de Azul Lago - Hidrolatos y productos naturales
const azulLagoProducts = [
  {
    model: "Hidrolato de Rosas",
    category: "Cosméticas",
    specs: {
      beneficios: "Hidrata y suaviza la piel, propiedades anti-edad, aroma relajante",
      ingredientes: "Agua destilada de rosas orgánicas, sin conservantes",
      presentacion: "Spray 100ml",
      usos: "Tónico facial, fijador de maquillaje, aromaterapia"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/hidrolato-rosas",
    price: 8500,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/hidrolato-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Hidrolato de Lavanda",
    category: "Aromáticas",
    specs: {
      beneficios: "Calma la piel irritada, propiedades antisépticas, relaja",
      ingredientes: "Agua destilada de lavanda orgánica, sin aditivos químicos",
      presentacion: "Spray 100ml",
      usos: "Tónico facial, spray para almohada, calmar irritaciones"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/hidrolato-lavanda",
    price: 7800,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/lavanda-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Hidrolato de Manzanilla",
    category: "Medicinales",
    specs: {
      beneficios: "Anti-inflamatorio, calma pieles sensibles, propiedades curativas",
      ingredientes: "Agua destilada de manzanilla orgánica, 100% natural",
      presentacion: "Spray 100ml",
      usos: "Compresas oculares, pieles sensibles, calmante natural"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/hidrolato-manzanilla",
    price: 7200,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/manzanilla-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Óleo Corporal Relajante",
    category: "Aromáticas",
    specs: {
      beneficios: "Hidrata profundamente, aroma relajante, mejora elasticidad",
      ingredientes: "Aceite de almendras, esencias naturales, vitamina E",
      presentacion: "Frasco 150ml",
      usos: "Masajes corporales, hidratación después del baño"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/oleo-corporal",
    price: 12500,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/oleo-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Crema Facial Hidratante",
    category: "Cosméticas",
    specs: {
      beneficios: "Hidratación 24h, reduce arrugas, protege la piel",
      ingredientes: "Ácido hialurónico, colágeno, extractos naturales",
      presentacion: "Tarro 50ml",
      usos: "Aplicar mañana y noche en rostro limpio"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/crema-facial",
    price: 15800,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/crema-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Jabón Artesanal de Aloe",
    category: "Medicinales",
    specs: {
      beneficios: "Limpia suavemente, propiedades curativas, ideal pieles sensibles",
      ingredientes: "Aloe vera, aceites naturales, glicerina vegetal",
      presentacion: "Barra 100g",
      usos: "Limpieza facial y corporal, pieles irritadas"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/jabon-aloe",
    price: 4500,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/jabon-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Tónico Facial Purificante",
    category: "Cosméticas",
    specs: {
      beneficios: "Limpia poros, equilibra pH, prepara la piel",
      ingredientes: "Hamamelis, agua de rosas, extracto de té verde",
      presentacion: "Botella 200ml",
      usos: "Aplicar después de la limpieza facial, mañana y noche"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/tonico-facial",
    price: 9200,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/tonico-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Aceite Esencial de Eucalipto",
    category: "Medicinales",
    specs: {
      beneficios: "Descongestionante, antibacteriano, energizante",
      ingredientes: "Aceite esencial 100% puro de eucalipto",
      presentacion: "Frasco 15ml",
      usos: "Aromaterapia, inhalaciones, masajes diluido"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/aceite-eucalipto",
    price: 6800,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/aceite-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Bálsamo Labial Natural",
    category: "Cosméticas",
    specs: {
      beneficios: "Hidrata y protege labios, ingredientes naturales",
      ingredientes: "Cera de abejas, manteca de karité, aceite de coco",
      presentacion: "Stick 4.5g",
      usos: "Aplicar cuando sea necesario en labios secos"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/balsamo-labial",
    price: 3200,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/balsamo-demo.mp4",
    website: "azullago.com"
  },
  {
    model: "Serum Facial Antioxidante",
    category: "Cosméticas",
    specs: {
      beneficios: "Combate radicales libres, mejora luminosidad, anti-edad",
      ingredientes: "Vitamina C, vitamina E, extracto de granada",
      presentacion: "Gotero 30ml",
      usos: "Aplicar antes de la crema hidratante, preferiblemente de noche"
    },
    image: "https://res.cloudinary.com/dx0htqhaq/image/upload/v1/azullago/serum-antioxidante",
    price: 18500,
    video: "https://res.cloudinary.com/dx0htqhaq/video/upload/v1/azullago/serum-demo.mp4",
    website: "azullago.com"
  }
];

async function clearProductsTable() {
  try {
    const client = await db.connect();
    await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
    console.log('✅ Products table cleared successfully!');
    await client.end();
  } catch (error) {
    console.error('❌ Error clearing products table:', error);
  }
}

async function createProductsTable() {
  try {
    const client = await db.connect();
    
    const createTable = await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        model VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        specs JSONB NOT NULL,
        image VARCHAR(255) NOT NULL,
        price DECIMAL NOT NULL,
        video VARCHAR(255),
        website VARCHAR(255),
        colors TEXT[] DEFAULT ARRAY[]::TEXT[],
        carrusel JSONB DEFAULT '{}'::JSONB,
        stock INTEGER DEFAULT 50,
        disable BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Products table created/verified successfully!');
    await client.end();
  } catch (error) {
    console.error('❌ Error creating products table:', error);
  }
}

async function injectProducts() {
  try {
    console.log('🚀 Starting product injection...');
    
    // Crear tabla si no existe
    await createProductsTable();
    
    // Limpiar tabla existente
    await clearProductsTable();
    
    const client = await db.connect();
    
    // Insertar productos uno por uno
    for (const product of azulLagoProducts) {
      try {
        const result = await client.query(
          `INSERT INTO products (model, category, specs, image, price, video, website, colors, carrusel, stock)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [
            product.model,
            product.category,
            JSON.stringify(product.specs),
            product.image,
            product.price,
            product.video,
            product.website,
            ['Natural'], // Color por defecto
            JSON.stringify({}), // Carrusel vacío por defecto
            50 // Stock por defecto
          ]
        );
        
        console.log(`✅ Inserted: ${product.model} (ID: ${result.rows[0].id})`);
      } catch (error) {
        console.error(`❌ Error inserting ${product.model}:`, error);
      }
    }
    
    // Verificar productos insertados
    const countResult = await client.query('SELECT COUNT(*) FROM products');
    console.log(`\n🎉 Product injection completed!`);
    console.log(`📊 Total products in database: ${countResult.rows[0].count}`);
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error during product injection:', error);
  }
}

// Ejecutar la inyección
if (require.main === module) {
  injectProducts().then(() => {
    console.log('\n✨ Product injection process finished!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { injectProducts, azulLagoProducts };
