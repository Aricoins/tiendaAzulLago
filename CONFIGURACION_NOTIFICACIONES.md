# 📧 CONFIGURACIÓN DE NOTIFICACIONES DE VENTA

## ✅ CAMBIOS IMPLEMENTADOS

### 1. **ADMINISTRADOR AGREGADO**
- ✅ `azullagocoop@gmail.com` agregado a la lista de administradores
- ✅ Acceso completo al dashboard de administración
- ✅ Recibirá notificaciones de todas las ventas

### 2. **SISTEMA DE NOTIFICACIONES**
- ✅ Email automático por cada venta realizada
- ✅ Notificación a todos los administradores
- ✅ Detalles completos del pedido
- ✅ Información del cliente
- ✅ Lista de productos vendidos

## 🔧 CONFIGURACIÓN REQUERIDA

### **PASO 1: Variables de Entorno**

Agregar estas variables a tu archivo `.env.local`:

```bash
# Para envío de emails (RECOMENDADO: Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Para webhooks detallados de MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxx
```

### **PASO 2: Configurar Resend**

1. **Registrarse** en [resend.com](https://resend.com)
2. **Crear API Key** en el dashboard
3. **Verificar dominio** azullago.com (opcional pero recomendado)
4. **Agregar clave** al archivo `.env.local`

### **PASO 3: Configurar Webhook MercadoPago**

1. **Ir al dashboard** de MercadoPago
2. **Agregar webhook** con URL: `https://tienda.azullago.com/api/sales-webhook`
3. **Seleccionar eventos**: `payment`
4. **Agregar token** de acceso al `.env.local`

## 📧 ADMINISTRADORES CONFIGURADOS

Las notificaciones se enviarán automáticamente a:

- ✅ `admin@azullago.com`
- ✅ `ariel@azullago.com` 
- ✅ `administrador@azullago.com`
- ✅ `arielrogeldev@gmail.com`
- ✅ `azullagocoop@gmail.com` **← NUEVO**

## 🧪 PROBAR EL SISTEMA

### **Opción 1: Compra Real**
Realizar una compra completa en la tienda

### **Opción 2: Test Manual**
```bash
curl -X POST https://tienda.azullago.com/api/test-sale-notification \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST-001",
    "customerName": "Cliente Prueba",
    "customerEmail": "cliente@test.com",
    "total": 5000,
    "items": [
      {
        "name": "Aceite Esencial Lavanda",
        "quantity": 1,
        "price": 5000
      }
    ]
  }'
```

## 📋 CONTENIDO DEL EMAIL

El email incluye:

### **📊 Resumen de Venta**
- Número de pedido
- Fecha y hora
- Total en pesos argentinos
- Método de pago

### **👤 Datos del Cliente**
- Nombre completo
- Email de contacto
- Dirección de envío (si está disponible)

### **🛍️ Productos Vendidos**
- Lista detallada de productos
- Cantidades y precios
- Subtotales por producto
- Total general

### **🔗 Acciones Rápidas**
- Botón para ver dashboard
- Link al pedido específico

## 🚀 ACTIVACIÓN

### **1. Compilar Proyecto**
```bash
npm run build
```

### **2. Deploy en Producción**
```bash
vercel --prod
```

### **3. Verificar Funcionamiento**
- Realizar una compra de prueba
- Verificar que llegue el email a `azullagocoop@gmail.com`
- Confirmar acceso al dashboard con el nuevo email

## 🔍 TROUBLESHOOTING

### **❌ No llegan emails**
1. Verificar `RESEND_API_KEY` en `.env.local`
2. Comprobar logs del servidor
3. Probar con `/api/test-sale-notification`

### **❌ Webhook no funciona**
1. Verificar URL del webhook en MercadoPago
2. Comprobar `MERCADOPAGO_ACCESS_TOKEN`
3. Revisar logs en `/api/sales-webhook`

### **❌ No aparece como admin**
1. Verificar que el email esté en `utils.ts`
2. Cerrar sesión y volver a iniciar
3. Revisar configuración de Clerk

## 📞 SOPORTE

Si necesitas ayuda:
1. Revisar logs de la aplicación
2. Probar APIs de test
3. Verificar configuración de variables de entorno

---

**🎉 ¡Sistema de notificaciones configurado exitosamente!**  
**📧 `azullagocoop@gmail.com` recibirá todas las notificaciones de venta**
