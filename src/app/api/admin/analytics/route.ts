import { NextResponse, NextRequest } from "next/server";

// Función para obtener analytics reales de Vercel
async function getVercelAnalytics() {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID || 'prj_EPENgwdrLwQ5MiAs3AMMLKWSXUGP';
    
    if (!vercelToken) {
      console.warn('⚠️ VERCEL_TOKEN no está configurado. Usando datos simulados...');
      return null;
    }

    const headers = {
      'Authorization': `Bearer ${vercelToken}`,
      'Content-Type': 'application/json'
    };

    // Fechas para los últimos 7 días
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const since = startDate.getTime();
    const until = endDate.getTime();

    // Obtener estadísticas de vistas de página
    const analyticsUrl = `https://api.vercel.com/v1/analytics/views?projectId=${projectId}&since=${since}&until=${until}`;
    
    console.log('🔍 Fetching Vercel Analytics:', analyticsUrl);
    
    const response = await fetch(analyticsUrl, { headers });
    
    if (!response.ok) {
      console.error('❌ Error fetching Vercel Analytics:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Vercel Analytics data:', data);

    // Procesar datos para el formato esperado
    const processedData = {
      pageViews: data.views?.reduce((sum: number, view: any) => sum + view.count, 0) || 0,
      uniqueVisitors: data.visitors || 0,
      topPages: data.pages?.slice(0, 5).map((page: any) => ({
        path: page.pathname,
        views: page.count,
        title: getPageTitle(page.pathname)
      })) || [],
      dailyViews: data.views?.map((view: any) => ({
        date: new Date(view.timestamp).toISOString().split('T')[0],
        views: view.count
      })) || [],
      countries: data.countries?.slice(0, 5).map((country: any) => ({
        country: country.name,
        visitors: country.count
      })) || [],
      devices: data.devices?.map((device: any) => ({
        device: device.name,
        percentage: Math.round((device.count / data.totalDevices) * 100)
      })) || []
    };

    return processedData;

  } catch (error) {
    console.error('❌ Error en getVercelAnalytics:', error);
    return null;
  }
}

// Función auxiliar para obtener títulos de páginas
function getPageTitle(pathname: string): string {
  const titles: { [key: string]: string } = {
    '/': 'Inicio',
    '/cart': 'Carrito',
    '/success': 'Compra Exitosa',
    '/failure': 'Error en Compra',
    '/admindashboard': 'Dashboard Admin',
    '/form': 'Formulario',
    '/pending': 'Pago Pendiente',
    '/verified': 'Verificado',
    '/banned': 'Bloqueado'
  };

  // Para rutas de productos dinámicas
  if (pathname.startsWith('/product/')) {
    return 'Producto';
  }

  return titles[pathname] || pathname;
}

// Datos simulados como fallback
function getMockAnalytics() {
  return {
    pageViews: 1542,
    uniqueVisitors: 423,
    averageSessionDuration: "2:34",
    bounceRate: "42%",
    topPages: [
      { path: "/", views: 326, title: "Inicio" },
      { path: "/product/1", views: 178, title: "Producto 1" },
      { path: "/cart", views: 89, title: "Carrito" },
      { path: "/product/2", views: 67, title: "Producto 2" },
      { path: "/form", views: 45, title: "Formulario" }
    ],
    dailyViews: [
      { date: "2025-01-07", views: 245 },
      { date: "2025-01-08", views: 189 },
      { date: "2025-01-09", views: 276 },
      { date: "2025-01-10", views: 198 },
      { date: "2025-01-11", views: 234 },
      { date: "2025-01-12", views: 289 },
      { date: "2025-01-13", views: 311 }
    ],
    countries: [
      { country: "Argentina", visitors: 156 },
      { country: "Chile", visitors: 78 },
      { country: "Uruguay", visitors: 45 },
      { country: "Brasil", visitors: 89 },
      { country: "Colombia", visitors: 55 }
    ],
    devices: [
      { device: "Mobile", percentage: 68 },
      { device: "Desktop", percentage: 28 },
      { device: "Tablet", percentage: 4 }
    ]
  };
}

export async function GET(req: NextRequest) {
  try {
    // Intentar obtener datos reales de Vercel Analytics
    let analytics = await getVercelAnalytics();
    
    // Si no se pudieron obtener datos reales, usar datos simulados
    if (!analytics) {
      console.log('📊 Using mock analytics data as fallback');
      analytics = getMockAnalytics();
    }

    return NextResponse.json({
      analytics,
      lastUpdated: new Date().toISOString(),
      source: analytics === getMockAnalytics() ? 'mock' : 'vercel'
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    // En caso de error, devolver datos simulados
    return NextResponse.json({
      analytics: getMockAnalytics(),
      lastUpdated: new Date().toISOString(),
      source: 'mock',
      error: 'Error al obtener análisis reales'
    });
  }
}
