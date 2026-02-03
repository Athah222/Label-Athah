
import type { ImagePlaceholder } from './placeholder-images';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: ImagePlaceholder[];
  category: string;
  stock: number;
  availableSizes?: string[];
}

export interface CartItem {
  id: string; // Composite ID: product.id + size
  product: Product;
  quantity: number;
  size: string;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ShippingAddress extends Address {
    id: string;
    userId: string;
    isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: number;
  razorpay_paymentId?: string;
  razorpay_orderId?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'customer';
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: number;
  isActive: boolean;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: number;
}
