// Utilidades para análisis de SEO y performance
export interface SEOMetrics {
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  openGraphTags: Record<string, string>;
  structuredData: any[];
  imageOptimization: {
    totalImages: number;
    optimizedImages: number;
    missingAltTags: number;
  };
  performance: {
    loadTime: number;
    coreWebVitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
    };
  };
}

export class SEOAnalyzer {
  static analyzePage(): SEOMetrics {
    if (typeof window === 'undefined') {
      throw new Error('SEOAnalyzer only works in browser environment');
    }

    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',') || [];
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    
    // Analizar Open Graph tags
    const ogTags: Record<string, string> = {};
    document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (property && content) {
        ogTags[property] = content;
      }
    });

    // Analizar structured data
    const structuredData: any[] = [];
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        structuredData.push(data);
      } catch (e) {
        console.warn('Invalid structured data found:', e);
      }
    });

    // Analizar imágenes
    const images = document.querySelectorAll('img');
    const totalImages = images.length;
    let optimizedImages = 0;
    let missingAltTags = 0;

    images.forEach(img => {
      if (!img.alt) missingAltTags++;
      if (img.loading === 'lazy' || img.dataset.optimized) optimizedImages++;
    });

    return {
      pageTitle: title,
      metaDescription,
      metaKeywords: keywords,
      canonicalUrl: canonical,
      openGraphTags: ogTags,
      structuredData,
      imageOptimization: {
        totalImages,
        optimizedImages,
        missingAltTags
      },
      performance: {
        loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0,
        coreWebVitals: {
          lcp: 0, // Estos se medirían con Web Vitals API
          fid: 0,
          cls: 0
        }
      }
    };
  }

  static generateSEOReport(metrics: SEOMetrics): string[] {
    const issues: string[] = [];
    
    // Validar título
    if (!metrics.pageTitle) {
      issues.push('❌ Título de página faltante');
    } else if (metrics.pageTitle.length > 60) {
      issues.push('⚠️ Título muy largo (>60 caracteres)');
    } else if (metrics.pageTitle.length < 30) {
      issues.push('⚠️ Título muy corto (<30 caracteres)');
    }

    // Validar meta description
    if (!metrics.metaDescription) {
      issues.push('❌ Meta descripción faltante');
    } else if (metrics.metaDescription.length > 160) {
      issues.push('⚠️ Meta descripción muy larga (>160 caracteres)');
    } else if (metrics.metaDescription.length < 120) {
      issues.push('⚠️ Meta descripción muy corta (<120 caracteres)');
    }

    // Validar canonical URL
    if (!metrics.canonicalUrl) {
      issues.push('⚠️ URL canónica faltante');
    }

    // Validar Open Graph
    if (!metrics.openGraphTags['og:title']) {
      issues.push('⚠️ Open Graph title faltante');
    }
    if (!metrics.openGraphTags['og:description']) {
      issues.push('⚠️ Open Graph description faltante');
    }
    if (!metrics.openGraphTags['og:image']) {
      issues.push('⚠️ Open Graph image faltante');
    }

    // Validar imágenes
    if (metrics.imageOptimization.missingAltTags > 0) {
      issues.push(`⚠️ ${metrics.imageOptimization.missingAltTags} imágenes sin texto alternativo`);
    }

    // Validar structured data
    if (metrics.structuredData.length === 0) {
      issues.push('⚠️ Datos estructurados faltantes');
    }

    if (issues.length === 0) {
      issues.push('✅ Todas las validaciones SEO pasaron correctamente');
    }

    return issues;
  }
}

// Hook para usar en componentes React
export function useSEOAnalysis() {
  if (typeof window === 'undefined') {
    return {
      metrics: null,
      issues: [],
      isLoading: true
    };
  }

  const metrics = SEOAnalyzer.analyzePage();
  const issues = SEOAnalyzer.generateSEOReport(metrics);

  return {
    metrics,
    issues,
    isLoading: false
  };
}
