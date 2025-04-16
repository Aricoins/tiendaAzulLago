const { db } = require('@vercel/postgres');
const products = require('../src/app/lib/products.json');

// Helper para generar URLs de video en formato Cloudinary
const generateVideoUrl = (productName) => {
  const baseUrl = 'https://res.cloudinary.com/dx0htqhaq/video/upload/';
  const videoCodes = [
    'v1744809596/z2mgalnbx492rkfs8iip', // Desinfectante
    'v1727569967/feattplfoqbo8j79xh1z', // Óleo 7
    'v1728318027/eqfvgtab8gqn5ziybgbn', // Limpiador
    'v1728319579/ftfv8lp6gwl0143iwl9q'  // Limpiador alternativo
  ];
  const randomCode = videoCodes[Math.floor(Math.random() * videoCodes.length)];
  return `${baseUrl}${randomCode}.mp4`;
};

async function clearProductsTable() {
  try {
    await db.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
    console.log('Products table cleared successfully!');
  } catch (error) {
    console.error('Error clearing products table:', error);
  }
}

async function seedProducts(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        model VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        specs JSONB NOT NULL,
        image VARCHAR(255) NOT NULL,
        price DECIMAL NOT NULL,
        video VARCHAR(255),
        disable BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log(`Created "products" table`);

    await clearProductsTable();

    // Insertar productos
    const insertedProducts = await Promise.all(
      products.map(async (product) => {
        return client.sql`
          INSERT INTO products (model, category, specs, image, price, video, disable)
          VALUES (
            ${product.model},
            ${product.category},
            ${product.specs},
            ${product.image},
            ${parseFloat(product.price)},
            ${product.video || generateVideoUrl(product.model)},
            ${product.disable || false}
          );
        `;
      }),
    );

    console.log(`Seeded ${insertedProducts.length} products`);
    console.log('Products:', insertedProducts);

    return {
      createTable,
      products: insertedProducts
    };
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await seedProducts(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});