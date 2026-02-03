
"use client";

import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

interface AddToCartFormProps {
    product: Product;
    selectedSize: string | null;
    onAddToCart: (product: Product, quantity: number, size: string | null) => void;
}

export function AddToCartForm({ product, selectedSize, onAddToCart }: AddToCartFormProps) {
    const [quantity, setQuantity] = useState(1);
    const { toast } = useToast();

    const handleQuantityChange = (change: number) => {
        setQuantity(prev => {
            const newQuantity = prev + change;
            if (newQuantity < 1) return 1;
            if (newQuantity > product.stock) {
                toast({
                    title: "Stock Limit",
                    description: `Cannot add more than ${product.stock} items.`,
                    variant: 'destructive',
                });
                return product.stock;
            }
            return newQuantity;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddToCart(product, quantity, selectedSize);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Quantity</h3>
                 <div className="flex items-center gap-2 w-fit border rounded-md">
                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-r-none" onClick={() => handleQuantityChange(-1)}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        className="h-10 w-12 text-center border-0 focus-visible:ring-0"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
                        min="1"
                        max={product.stock}
                    />
                    <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-l-none" onClick={() => handleQuantityChange(1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <Button type="submit" size="lg" variant="outline" className="w-full h-12 text-base">
                Add to Cart
            </Button>
        </form>
    );
}
