export interface ProductSpecs {
  platform: string;
  description: string;
  [key: string]: any;
}

export interface Products {
  id: string;
  model: string;
  category: string;
  specs: ProductSpecs;
  image: string;
  colors: string[];
  price: number;
  stock?: number;
  carrusel: object;
  video: string;
  website: string;
  disable?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CartItem {
  cart_item_id: number;
  user_id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  disable?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Order {
  id: string;
  preference_id: string;
  email: string;
  name?: string;
  surname?: string;
  dni?: string;
  phone?: string;
  address?: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
}
