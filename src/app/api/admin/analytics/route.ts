import { NextResponse, NextRequest } from "next/server";

export const runtime = 'nodejs';

// Función para obtener analytics reales de Vercel
async function getVercelAnalytics(daysBack: number = 7) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID || 'prj_EPENgwdrLwQ5MiAs3AMMLKWSXUGP';
    
    if (!vercelToken) {
      console.warn('⚠️ VERCEL_TOKEN no está configurado. Usando datos simulados...');
      return null;
    }

    // Fechas basadas en el período solicitado
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Convertir a timestamps en milisegundos
    const since = startDate.getTime();
    const until = endDate.getTime();

    // Intentar múltiples endpoints de analytics de Vercel
    const analyticsEndpoints = [
      // Web Analytics API (más reciente)
      `https://api.vercel.com/v1/web-analytics/${projectId}/stats?since=${since}&until=${until}`,
      // Edge Config Analytics (si está disponible)
      `https://api.vercel.com/v1/analytics/${projectId}?since=${since}&until=${until}`,
      // Analytics básico
      `https://api.vercel.com/v1/projects/${projectId}/analytics?since=${since}&until=${until}`
    ];

    const headers = {
      'Authorization': `Bearer ${vercelToken}`,
      'Content-Type': 'application/json'
    };
    
    for (const [index, url] of analyticsEndpoints.entries()) {
      try {
        console.log(`� Intentando endpoint ${index + 1}:`, url);
        
        const response = await fetch(url, { headers });
        
        console.log(`📊 Response status (endpoint ${index + 1}):`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Datos de analytics obtenidos desde endpoint ${index + 1}:`, data);

          // Procesar datos según la estructura del endpoint que funcionó
          const processedData = processAnalyticsData(data);
          return processedData;
        } else {
          const errorText = await response.text();
          console.warn(`⚠️ Endpoint ${index + 1} falló (${response.status}):`, errorText);
        }
      } catch (error) {
        console.warn(`⚠️ Error en endpoint ${index + 1}:`, error);
      }
    }

    // Si ningún endpoint funcionó, intentar sin analytics específicos
    console.log('🔍 Intentando obtener información básica del proyecto...');
    try {
      const projectUrl = `https://api.vercel.com/v1/projects/${projectId}`;
      const projectResponse = await fetch(projectUrl, { headers });
      
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        console.log('✅ Información del proyecto obtenida:', projectData.name);
        
        // Retornar datos básicos basados en la información del proyecto
        return generateBasicAnalytics(projectData, daysBack);
      }
    } catch (error) {
      console.error('❌ Error obteniendo información del proyecto:', error);
    }

    return null;

  } catch (error) {
    console.error('❌ Error en getVercelAnalytics:', error);
    return null;
  }
}

// Función para procesar datos de analytics según la estructura
function processAnalyticsData(data: any) {
  // Adaptable a diferentes estructuras de respuesta de Vercel
  return {
    pageViews: data.pageviews || data.views || data.total_pageviews || 0,
    uniqueVisitors: data.uniques || data.visitors || data.unique_visitors || 0,
    topPages: data.pages?.slice(0, 5).map((page: any) => ({
      path: page.pathname || page.path || page.url,
      views: page.views || page.count || page.pageviews,
      title: getPageTitle(page.pathname || page.path || page.url)
    })) || [],
    dailyViews: data.timeseries?.map((entry: any) => ({
      date: entry.date || entry.timestamp,
      views: entry.views || entry.pageviews || entry.count
    })) || [],
    countries: data.countries?.slice(0, 5).map((country: any) => ({
      country: country.name || country.country_code,
      visitors: country.visitors || country.count
    })) || [],
    devices: data.devices?.map((device: any) => ({
      device: device.name || device.device_type,
      percentage: device.percentage || Math.round((device.count / (data.total_devices || 100)) * 100)
    })) || []
  };
}

// Función para generar analytics básicos cuando no hay datos específicos
function generateBasicAnalytics(projectData: any, daysBack: number = 7) {
  const now = new Date();
  
  // Generar datos realistas basados en el proyecto y período
  const dailyViews = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Variar las vistas según el día de la semana
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseViews = isWeekend ? 15 : 35; // Menos tráfico en fines de semana
    const variation = Math.floor(Math.random() * 25); // Variación aleatoria
    
    dailyViews.push({
      date: date.toISOString().split('T')[0],
      views: baseViews + variation
    });
  }
  
  const totalViews = dailyViews.reduce((sum, day) => sum + day.views, 0);
  
  return {
    pageViews: totalViews,
    uniqueVisitors: Math.floor(totalViews * 0.7), // ~70% de visitantes únicos
    topPages: [
      { path: '/', views: Math.floor(totalViews * 0.4), title: 'Inicio' },
      { path: '/product', views: Math.floor(totalViews * 0.3), title: 'Productos' },
      { path: '/cart', views: Math.floor(totalViews * 0.2), title: 'Carrito' },
      { path: '/form', views: Math.floor(totalViews * 0.1), title: 'Contacto' }
    ],
    dailyViews,
    countries: [
      { country: 'Argentina', visitors: Math.floor(totalViews * 0.6) },
      { country: 'Colombia', visitors: Math.floor(totalViews * 0.2) },
      { country: 'México', visitors: Math.floor(totalViews * 0.1) },
      { country: 'España', visitors: Math.floor(totalViews * 0.1) }
    ],
    devices: [
      { device: 'Mobile', percentage: 65 },
      { device: 'Desktop', percentage: 30 },
      { device: 'Tablet', percentage: 5 }
    ]
  };
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
function getMockAnalytics(daysBack: number = 7) {
  const now = new Date();
  
  // Generar datos diarios para el período especificado
  const dailyViews = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Simular patrones realistas de tráfico
    let baseViews;
    if (daysBack === 1) {
      baseViews = 45; // Día actual
    } else if (daysBack === 7) {
      baseViews = isWeekend ? 25 : 55; // Semana
    } else if (daysBack === 30) {
      baseViews = isWeekend ? 20 : 50; // Mes
    } else {
      baseViews = isWeekend ? 18 : 48; // Otros períodos
    }
    
    const variation = Math.floor(Math.random() * 20) - 10; // Variación ±10
    dailyViews.push({
      date: date.toISOString().split('T')[0],
      views: Math.max(1, baseViews + variation)
    });
  }
  
  const totalViews = dailyViews.reduce((sum, day) => sum + day.views, 0);
  const uniqueVisitors = Math.floor(totalViews * 0.72); // ~72% visitantes únicos
  
  return {
    pageViews: totalViews,
    uniqueVisitors: uniqueVisitors,
    averageSessionDuration: daysBack === 1 ? "2:45" : daysBack === 7 ? "2:34" : "2:28",
    bounceRate: daysBack === 1 ? "38%" : daysBack === 7 ? "42%" : "45%",
    topPages: [
      { path: "/", views: Math.floor(totalViews * 0.35), title: "Inicio" },
      { path: "/product", views: Math.floor(totalViews * 0.28), title: "Productos" },
      { path: "/cart", views: Math.floor(totalViews * 0.15), title: "Carrito" },
      { path: "/form", views: Math.floor(totalViews * 0.12), title: "Contacto" },
      { path: "/admindashboard", views: Math.floor(totalViews * 0.10), title: "Dashboard" }
    ],
    dailyViews,
    countries: [
      { country: "Argentina", visitors: Math.floor(uniqueVisitors * 0.58) },
      { country: "Colombia", visitors: Math.floor(uniqueVisitors * 0.22) },
      { country: "México", visitors: Math.floor(uniqueVisitors * 0.12) },
      { country: "España", visitors: Math.floor(uniqueVisitors * 0.08) }
    ],
    devices: [
      { device: "Mobile", percentage: daysBack === 1 ? 68 : 65 },
      { device: "Desktop", percentage: daysBack === 1 ? 27 : 30 },
      { device: "Tablet", percentage: daysBack === 1 ? 5 : 5 }
    ],
    referrers: [
      { source: "Direct", visitors: Math.floor(uniqueVisitors * 0.45) },
      { source: "Google", visitors: Math.floor(uniqueVisitors * 0.32) },
      { source: "Facebook", visitors: Math.floor(uniqueVisitors * 0.15) },
      { source: "Instagram", visitors: Math.floor(uniqueVisitors * 0.08) }
    ]
  };
}

export async function GET(request: Request) {
  try {
    console.log('🔍 Fetching analytics data...');
    
    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7'; // Días por defecto
    const daysBack = parseInt(period);
    
    console.log(`📊 Obteniendo analytics para los últimos ${daysBack} días`);
    
    // Obtener analytics con período específico
    let analytics = await getVercelAnalytics(daysBack);
    
    if (!analytics) {
      console.log('📊 Using mock analytics data as fallback');
      analytics = getMockAnalytics(daysBack);
    }

    return NextResponse.json({
      analytics,
      lastUpdated: new Date().toISOString(),
      source: 'mock', // Por ahora siempre mock hasta que tengamos Vercel Analytics funcionando
      period: daysBack
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    // En caso de error, devolver datos simulados
    // Reparse the URL to get period in catch block
    const { searchParams } = new URL(request.url);
    const periodFallback = searchParams.get('period') || '7';
    const daysBackFallback = parseInt(periodFallback);
    
    return NextResponse.json({
      analytics: getMockAnalytics(daysBackFallback),
      lastUpdated: new Date().toISOString(),
      source: 'mock',
      error: 'Error al obtener análisis reales',
      period: daysBackFallback
    });
  }
}
