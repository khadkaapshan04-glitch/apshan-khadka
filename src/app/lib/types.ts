// Shared type definitions for Flavoré Restaurant Management System
// These mirror the Supabase database schema

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'staff' | 'admin';
  loyalty_points?: number;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Starters' | 'Mains' | 'Desserts' | 'Beverages';
  image_url: string;
  is_available: boolean;
  created_at?: string;
}

export interface Review {
  id: string;
  menu_item_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  type: OrderType;
  table_number?: string;
  delivery_address?: string;
  delivery_phone?: string;
  delivery_notes?: string;
  estimated_delivery?: string;
  discount_amount?: number;
  promo_code?: string;
  loyalty_points_earned?: number;
  payment_method?: 'cash' | 'card' | 'digital-wallet';
  payment_status?: 'pending' | 'paid' | 'failed';
  user_id?: string;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  is_active: boolean;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  phone: string;
  party_size: number;
  status: 'waiting' | 'seated' | 'cancelled';
  user_id?: string;
  created_at: string;
}

export interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  type: 'front table' | 'window' | 'corner' | 'middle' | 'bar';
  position_x: number;
  position_y: number;
  created_at?: string;
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  table_id?: string;
  table_number?: string;
  user_id?: string;
  created_at: string;
}

// Legacy compatibility: map old position format { x, y } to flat fields
export function toRestaurantTableWithPosition(table: RestaurantTable): RestaurantTable & { position: { x: number; y: number } } {
  return {
    ...table,
    position: { x: table.position_x, y: table.position_y }
  };
}
