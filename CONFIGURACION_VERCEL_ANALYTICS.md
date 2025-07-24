# 📊 Configuración de Vercel Analytics para el Dashboard

## Objetivo
Integrar las estadísticas reales de Vercel Analytics en el dashboard administrativo para mostrar datos reales de tráfico, páginas más visitadas, dispositivos, países, etc.

## Configuración Requerida

### 1. Obtener Token de Vercel

1. **Accede a tu cuenta de Vercel:**
   - Ve a [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Inicia sesión en tu cuenta

2. **Crear un nuevo token:**
   - Haz clic en "Create Token"
   - Dale un nombre descriptivo como "Dashboard Analytics"
   - Selecciona el scope adecuado (al menos read access para analytics)
   - Copia el token generado

3. **Configurar variables de entorno:**
   ```bash
   # En tu archivo .env.local
   VERCEL_TOKEN=tu_token_aqui
   VERCEL_PROJECT_ID=prj_EPENgwdrLwQ5MiAs3AMMLKWSXUGP
   ```

### 2. Configuración en Vercel (Producción)

Para que funcione en producción, agrega las variables de entorno en Vercel:

```bash
# Usando Vercel CLI
vercel env add VERCEL_TOKEN production
vercel env add VERCEL_PROJECT_ID production

# O mediante el dashboard de Vercel:
# Settings > Environment Variables
```

## Funcionalidades Implementadas

### 📈 Métricas Principales
- **Vistas de Página:** Total de páginas vistas en los últimos 7 días
- **Visitantes Únicos:** Número de visitantes únicos
- **Sesión Promedio:** Duración promedio de las sesiones
- **Tasa de Rebote:** Porcentaje de visitantes que salen sin interactuar

### 📄 Páginas Más Visitadas
- Top 5 páginas con más tráfico
- Títulos descriptivos y rutas
- Número de vistas por página

### 📱 Análisis de Dispositivos
- Distribución por tipo de dispositivo (Mobile, Desktop, Tablet)
- Gráficos de barras con porcentajes

### 🌎 Distribución Geográfica
- Top 5 países con más visitantes
- Número de visitantes por país

### 📊 Tendencias Diarias
- Vistas por día en los últimos 7 días
- Gráfico de barras para visualizar tendencias

## Funcionalidades Técnicas

### 🔄 Fallback Inteligente
- Si no se puede conectar a Vercel Analytics, se muestran datos demo
- Indicador visual del tipo de datos (Reales vs Demo)

### 🔄 Actualización Manual
- Botón para refrescar datos en tiempo real
- Indicador de carga durante la actualización

### 🛡️ Manejo de Errores
- Logs detallados para debugging
- Mensajes de error informativos para el usuario

## Estructura de la API

### Endpoint Principal
```
GET /api/admin/analytics
```

### Respuesta de la API
```json
{
  "analytics": {
    "pageViews": 1542,
    "uniqueVisitors": 423,
    "averageSessionDuration": "2:34",
    "bounceRate": "42%",
    "topPages": [...],
    "dailyViews": [...],
    "countries": [...],
    "devices": [...]
  },
  "lastUpdated": "2025-07-13T10:00:00.000Z",
  "source": "vercel" | "mock"
}
```

## Solución de Problemas

### ❌ Error: "VERCEL_TOKEN no está configurado"
- **Causa:** Falta la variable de entorno VERCEL_TOKEN
- **Solución:** Agregar el token en `.env.local` y en Vercel

### ❌ Error 401: Unauthorized
- **Causa:** Token inválido o expirado
- **Solución:** Generar un nuevo token en Vercel

### ❌ Error 404: Project not found
- **Causa:** VERCEL_PROJECT_ID incorrecto
- **Solución:** Verificar el ID del proyecto en Vercel

### ⚠️ Datos Demo mostrados
- **Causa:** No se puede conectar a Vercel Analytics
- **Efecto:** Se muestran datos simulados con indicador visual
- **Acción:** Verificar configuración de tokens

## Próximas Mejoras

### 🚀 Funcionalidades Avanzadas
- [ ] Métricas de conversión
- [ ] Análisis de funnel de ventas
- [ ] Comparación con períodos anteriores
- [ ] Exportación de datos a CSV/PDF
- [ ] Alertas automáticas por cambios significativos

### 📊 Visualizaciones
- [ ] Gráficos interactivos con Chart.js
- [ ] Mapa mundial de visitantes
- [ ] Análisis de flujo de usuarios

## Seguridad

### 🔒 Mejores Prácticas
- El token de Vercel solo es accesible desde el servidor
- Datos sensibles no se exponen al cliente
- Logs de seguridad para accesos no autorizados

### 🛡️ Permisos
- Solo usuarios admin pueden acceder a analytics
- Verificación de roles en cada request
- Rate limiting para prevenir abuso

## Monitoreo

### 📊 Métricas de Performance
- Tiempo de respuesta de la API
- Tasa de éxito de conexiones a Vercel
- Uso de caché para optimizar requests

### 🔍 Logging
- Requests exitosos y fallidos
- Tiempo de respuesta
- Errores de configuración

---

**Nota:** Los analytics se actualizan automáticamente cada 24 horas en Vercel. Para datos en tiempo real, considera usar Vercel Analytics Pro.
