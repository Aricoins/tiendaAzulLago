# 🚀 GUÍA RÁPIDA: Agregar Productos al Ecommerce

## Método 1: Editar products.json (MÁS RÁPIDO)

1. **Edita el archivo products.json**:
   - Abre: `src/app/lib/products.json`
   - Agrega nuevos productos siguiendo este formato:

```json
{
  "id": 99,
  "model": "Nombre del Producto",
  "image": "https://res.cloudinary.com/dx0htqhaq/image/upload/v1234567890/imagen.jpg",
  "category": "Medicinales", // Opciones: "Medicinales", "Cosméticas", "Aromáticas"
  "price": "15000", // Precio en string
  "specs": {
    "beneficios": "Descripción de los beneficios del producto",
    "ingredientes": "Lista de ingredientes",
    "presentacion": "Formato y tamaño del producto"
  },
  "video": "https://res.cloudinary.com/dx0htqhaq/video/upload/v1234567890/video.mp4"
}
```

2. **Ejecuta el seed**:
```bash
npm run seed
```

## Método 2: API Admin Dashboard (RECOMENDADO)

Crear un dashboard de administración para agregar productos desde la web.

## Método 3: Bulk Upload CSV

Subir múltiples productos desde un archivo CSV.

## Método 4: API Direct

Usar la API directamente para agregar productos.
