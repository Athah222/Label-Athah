import type { Product, Order, Coupon } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Ethereal Golden Saree',
    slug: 'ethereal-golden-saree',
    description:
      'Woven with threads of liquid gold, this silk saree is a masterpiece of traditional craftsmanship. Its ethereal drape and subtle sheen make it perfect for momentous occasions.',
    price: 499.99,
    images: PlaceHolderImages.filter((p) => p.id.includes('silk-saree')),
    category: 'Sarees',
    stock: 15,
  },
  {
    id: '2',
    name: 'Regal Embroidered Sherwani',
    slug: 'regal-embroidered-sherwani',
    description:
      'A sherwani designed for the modern royal. Featuring intricate hand-embroidery and a tailored fit, this garment exudes sophistication and grace.',
    price: 799.99,
    images: PlaceHolderImages.filter((p) => p.id.includes('sherwani')),
    category: 'Sherwanis',
    stock: 10,
  },
  {
    id: '3',
    name: 'Crimson Garden Lehenga',
    slug: 'crimson-garden-lehenga',
    description:
      'Dance the night away in this vibrant lehenga, adorned with floral motifs and a flowing skirt that captures the essence of a blooming garden.',
    price: 650.0,
    images: PlaceHolderImages.filter((p) => p.id.includes('lehenga')),
    category: 'Lehengas',
    stock: 12,
  },
  {
    id: '4',
    name: 'Classic Ivory Kurta',
    slug: 'classic-ivory-kurta',
    description:
      'The epitome of understated elegance. This classic men\'s kurta, made from the finest linen, offers both comfort and timeless style.',
    price: 189.99,
    images: PlaceHolderImages.filter((p) => p.id.includes('kurta')),
    category: 'Kurtas',
    stock: 25,
  },
  {
    id: '5',
    name: 'Midnight Bloom Dress',
    slug: 'midnight-bloom-dress',
    description:
      'A contemporary fusion dress that combines modern silhouettes with traditional patterns. Perfect for a chic, cosmopolitan look.',
    price: 320.0,
    images: PlaceHolderImages.filter((p) => p.id.includes('dress')),
    category: 'Dresses',
    stock: 20,
  },
  {
    id: '6',
    name: 'Heirloom Temple Jewelry Set',
    slug: 'heirloom-temple-jewelry-set',
    description:
      'An exquisite set of temple jewelry, handcrafted with intricate details. A timeless accessory to complement your traditional attire.',
    price: 850.0,
    images: PlaceHolderImages.filter((p) => p.id.includes('accessories')),
    category: 'Accessories',
    stock: 8,
  },
];

export const mockOrders: Order[] = [
    {
      id: 'ATHAH-8675',
      userId: 'user-123',
      items: [
        { id: '1', product: mockProducts[0], quantity: 1 },
      ],
      total: 499.99,
      status: 'Shipped',
      shippingAddress: { name: 'Jane Doe', street: '123 Elegance St', city: 'Metropolis', state: 'NY', zip: '10001', country: 'USA' },
      billingAddress: { name: 'Jane Doe', street: '123 Elegance St', city: 'Metropolis', state: 'NY', zip: '10001', country: 'USA' },
      createdAt: new Date('2023-10-26').getTime(),
    },
    {
      id: 'ATHAH-3456',
      userId: 'user-123',
      items: [
        { id: '2', product: mockProducts[1], quantity: 1 },
        { id: '3', product: mockProducts[2], quantity: 1 },
      ],
      total: 1449.99,
      status: 'Processing',
      shippingAddress: { name: 'Jane Doe', street: '123 Elegance St', city: 'Metropolis', state: 'NY', zip: '10001', country: 'USA' },
      billingAddress: { name: 'Jane Doe', street: '123 Elegance St', city: 'Metropolis', state: 'NY', zip: '10001', country: 'USA' },
      createdAt: new Date('2023-11-15').getTime(),
    },
     {
      id: 'ATHAH-9812',
      userId: 'user-456',
      items: [
        { id: '4', product: mockProducts[3], quantity: 2 },
      ],
      total: 379.98,
      status: 'Delivered',
      shippingAddress: { name: 'John Smith', street: '456 Style Ave', city: 'Gotham', state: 'NJ', zip: '07001', country: 'USA' },
      billingAddress: { name: 'John Smith', street: '456 Style Ave', city: 'Gotham', state: 'NJ', zip: '07001', country: 'USA' },
      createdAt: new Date('2023-10-01').getTime(),
    },
];

export const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'FESTIVE15',
    discountType: 'percentage',
    discountValue: 15,
    expiresAt: new Date('2024-12-31').getTime(),
    isActive: true,
  },
  {
    id: '2',
    code: 'NEWYOU',
    discountType: 'fixed',
    discountValue: 50,
    expiresAt: new Date('2024-11-30').getTime(),
    isActive: true,
  },
  {
    id: '3',
    code: 'EXPIREDLOVE',
    discountType: 'percentage',
    discountValue: 20,
    expiresAt: new Date('2023-01-01').getTime(),
    isActive: false,
  },
]
