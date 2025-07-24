import { NextResponse, NextRequest } from "next/server";

export const runtime = 'nodejs';

// MOCK DATA BASADO EN CSV EXPORTADOS DE VERCEL, ADAPTADO AL FORMATO QUE ESPERA EL FRONTEND
const MOCK_ANALYTICS = {
  pageViews: 133,
  uniqueVisitors: 10,
  bounceRate: '40%',
  averageSessionDuration: 'N/A',
  topPages: [
    { title: '/', path: '/', views: 54 },
    { title: '/admindashboard', path: '/admindashboard', views: 45 },
    { title: '/cart', path: '/cart', views: 8 },
    { title: '/form', path: '/form', views: 7 },
    { title: '/product', path: '/product', views: 3 },
    { title: '/product/4', path: '/product/4', views: 4 },
    { title: '/product/1', path: '/product/1', views: 5 },
    { title: '/product/2', path: '/product/2', views: 3 },
    { title: '/product/5', path: '/product/5', views: 2 },
    { title: '/adminDashboard', path: '/adminDashboard', views: 1 },
    { title: '/quick-admin', path: '/quick-admin', views: 1 },
  ],
  referrers: [
    { referrer: 'vercel.com', visitors: 3, total: 5 }
  ],
  devices: [
    { device: 'desktop', percentage: 92, visitors: 6, total: 122 },
    { device: 'mobile', percentage: 8, visitors: 4, total: 11 }
  ],
  countries: [
    { country: 'AR', visitors: 8, total: 131 },
    { country: 'BR', visitors: 2, total: 2 }
  ],
  os: [
    { os: 'Windows', visitors: 6, total: 122 },
    { os: 'Android', visitors: 3, total: 10 },
    { os: 'iOS', visitors: 1, total: 1 }
  ],
  dailyViews: [
    { date: '2025-07-07', views: 10 },
    { date: '2025-07-08', views: 12 },
    { date: '2025-07-09', views: 15 },
    { date: '2025-07-10', views: 20 },
    { date: '2025-07-11', views: 25 },
    { date: '2025-07-12', views: 30 },
    { date: '2025-07-13', views: 21 }
  ],
  period: "Jul 6, 21:00 - Jul 13, 20:59",
  source: 'mock-csv-vercel'
};

export async function GET(request: NextRequest) {
  // Devuelve los datos mock en el formato esperado por el frontend
  return NextResponse.json({
    success: true,
    analytics: MOCK_ANALYTICS,
    period: MOCK_ANALYTICS.period,
    timestamp: new Date().toISOString(),
    source: MOCK_ANALYTICS.source
  });
}
