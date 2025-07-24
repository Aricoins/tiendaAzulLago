import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test básico de conexión
    const testConnection = await sql`SELECT 1 as test`;
    console.log('✅ Database connection OK:', testConnection);

    // Test de tabla products
    let productsTest;
    try {
      productsTest = await sql`SELECT COUNT(*) as count FROM products LIMIT 1`;
      console.log('✅ Products table accessible:', productsTest);
    } catch (error) {
      console.error('❌ Products table error:', error);
      productsTest = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test de tabla users
    let usersTest;
    try {
      usersTest = await sql`SELECT COUNT(*) as count FROM users LIMIT 1`;
      console.log('✅ Users table accessible:', usersTest);
    } catch (error) {
      console.error('❌ Users table error:', error);
      usersTest = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test de variables de entorno
    const envTest = {
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || 'not set',
      NODE_ENV: process.env.NODE_ENV
    };

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      connection: testConnection,
      tables: {
        products: productsTest,
        users: usersTest
      },
      environment: envTest
    });

  } catch (error) {
    console.error('❌ Database diagnostic failed:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: {
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || 'not set',
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
