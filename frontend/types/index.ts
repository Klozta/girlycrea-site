/**
 * Types TypeScript pour le frontend GirlyCrea
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  category?: string;
  stock?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data?: T;
  products?: T[];
  orders?: T[];
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}



