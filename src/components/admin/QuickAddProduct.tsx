'use client';

import { useState } from 'react';
import { Form, Input, Select, Button, message, Upload, InputNumber } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

export default function QuickAddProduct() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const categories = [
    'Medicinales',
    'Cosméticas', 
    'Aromáticas'
  ];

  const onFinish = async (values: any) => {
    setLoading(true);
    
    try {
      const productData = {
        model: values.model,
        category: values.category,
        price: values.price.toString(),
        image: values.image,
        video: values.video || '',
        specs: {
          beneficios: values.beneficios || '',
          ingredientes: values.ingredientes || '',
          presentacion: values.presentacion || ''
        }
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (response.ok) {
        message.success('Producto agregado exitosamente!');
        form.resetFields();
      } else {
        message.error(result.message || 'Error al agregar producto');
      }
    } catch (error) {
      message.error('Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Agregar Producto Rápido</h2>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-4"
      >
        <Form.Item
          name="model"
          label="Nombre del Producto"
          rules={[{ required: true, message: 'Ingresa el nombre del producto' }]}
        >
          <Input placeholder="Ej: Óleo 7" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Categoría"
          rules={[{ required: true, message: 'Selecciona una categoría' }]}
        >
          <Select placeholder="Selecciona categoría">
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="price"
          label="Precio (ARS)"
          rules={[{ required: true, message: 'Ingresa el precio' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="15000"
            min={0}
            prefix="$"
          />
        </Form.Item>

        <Form.Item
          name="image"
          label="URL de Imagen"
          rules={[{ required: true, message: 'Ingresa la URL de la imagen' }]}
        >
          <Input placeholder="https://res.cloudinary.com/..." />
        </Form.Item>

        <Form.Item
          name="video"
          label="URL de Video (opcional)"
        >
          <Input placeholder="https://res.cloudinary.com/..." />
        </Form.Item>

        <Form.Item
          name="beneficios"
          label="Beneficios"
        >
          <TextArea 
            rows={3} 
            placeholder="Describe los beneficios del producto..."
          />
        </Form.Item>

        <Form.Item
          name="ingredientes"
          label="Ingredientes"
        >
          <TextArea 
            rows={2} 
            placeholder="Lista los ingredientes..."
          />
        </Form.Item>

        <Form.Item
          name="presentacion"
          label="Presentación"
        >
          <Input placeholder="Ej: Roll-on 10ml" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="w-full bg-blue-500 hover:bg-blue-600"
            size="large"
          >
            {loading ? 'Agregando...' : 'Agregar Producto'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
