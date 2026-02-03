'use client';

import { useMemo, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ProductCard } from '@/components/product-card';
import MainLayout from '@/components/main-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageOpen } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductFilters } from '../product-filters';

const mensCategories = ["Kurtas", "Casual Shirts"];

export default function MensProductsPage() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), where('category', 'in', mensCategories)), [firestore]);
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const [filters, setFilters] = useState<{
    categories: string[];
    priceRange: [number, number];
    sort: string;
  }>({
    categories: [],
    priceRange: [0, 100000],
    sort: 'price-asc',
  });
  
  const categories = useMemo(() => {
    if (!products) return [];
    const allCategories = products.map(p => p.category);
    return [...new Set(allCategories)];
  }, [products]);

  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 100000;
    return Math.max(...products.map(p => p.price), 1000);
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];

    // Filter by category
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Filter by price
    filtered = filtered.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

    // Sort
    switch (filters.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [products, filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({...prev, ...newFilters}));
  }

  // Update initial price range once maxPrice is calculated
  useState(() => {
    if (maxPrice !== 100000) {
      setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
    }
  });


  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="font-headline text-4xl md:text-5xl">Men's Wear</h1>
          <p className="mt-2 text-lg text-muted-foreground">Discover our collection for men</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <ProductFilters 
              categories={categories}
              maxPrice={maxPrice}
              onFilterChange={handleFilterChange}
              currentFilters={filters}
            />
          </aside>
          
          <main className="lg:col-span-3">
             {isLoading && (
               <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredAndSortedProducts.length > 0 && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            {!isLoading && filteredAndSortedProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center h-full">
                    <PackageOpen className="h-16 w-16 text-muted-foreground/50" />
                    <h2 className="mt-6 font-headline text-2xl">No Products Found</h2>
                    <p className="mt-2 text-muted-foreground">
                        Try adjusting your filters to find what you're looking for.
                    </p>
                </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
