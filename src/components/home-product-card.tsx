
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

interface HomeProductCardProps {
  product: Product;
}

export function HomeProductCard({ product }: HomeProductCardProps) {
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
