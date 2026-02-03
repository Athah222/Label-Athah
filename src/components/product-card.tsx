
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Default to the first available size if multiple, or 'one-size' if none are specified.
    const size = product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes[0] : 'one-size';
    addToCart(product, 1, size);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block text-center">
      <div className="overflow-hidden rounded-lg">
        <div className="relative aspect-[3/4] w-full bg-secondary">
          <Image
            src={product.images[0].imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={product.images[0].imageHint}
          />
        </div>
      </div>
       <div className="mt-4 space-y-1">
          <h3 className="font-headline text-lg tracking-tight text-foreground">{product.name}</h3>
          <p className="text-base text-muted-foreground">
            {formatPrice(product.price)}
          </p>
        </div>
    </Link>
  );
}
