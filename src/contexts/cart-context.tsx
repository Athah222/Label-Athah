
"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import type { Product, CartItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, size: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);


  const addToCart = (product: Product, quantity: number, size: string) => {
    // If a size is not selected, we default to the first available size for products that need a size.
    // For products that don't have sizes, we can use a generic size like 'one-size'.
    const selectedSize = size || (product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes[0] : 'one-size');
    const cartItemId = `${product.id}-${selectedSize}`;
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItemId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast({
            title: "Stock Limit Exceeded",
            description: `You can't add more than ${product.stock} items.`,
            variant: "destructive",
          });
          return prevItems;
        }
        return prevItems.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prevItems, { id: cartItemId, product, quantity, size: selectedSize }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} (Size: ${selectedSize}) has been added to your cart.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prevItems => {
        const itemToUpdate = prevItems.find(item => item.id === itemId);
        if (!itemToUpdate) return prevItems;

        if(quantity <= 0) {
            return prevItems.filter(item => item.id !== itemId);
        }

        if (quantity > itemToUpdate.product.stock) {
            toast({
                title: "Stock Limit Exceeded",
                description: `Only ${itemToUpdate.product.stock} items available.`,
                variant: "destructive",
            });
            return prevItems.map(item =>
                item.id === itemId ? { ...item, quantity: itemToUpdate.product.stock } : item
            );
        }

        return prevItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
        );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
