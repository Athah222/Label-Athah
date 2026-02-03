
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Package } from 'lucide-react';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const firestore = useFirestore();
    const router = useRouter();
    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsCollection);
    
    const [search, setSearch] = useState('');

    useEffect(() => {
        setSearch(''); // Reset search on open/close
    }, [open]);

    const handleSelect = (slug: string) => {
        router.push(`/product/${slug}`);
        onOpenChange(false);
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput 
                placeholder="Search for products..."
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                {isLoading && <CommandEmpty>Loading products...</CommandEmpty>}
                {!isLoading && (
                    <>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {search && products && (
                          <CommandGroup heading="Products">
                              {products?.map(product => (
                                  <CommandItem
                                      key={product.id}
                                      value={`${product.name} ${product.category} ${product.description}`}
                                      onSelect={() => handleSelect(product.slug)}
                                  >
                                      <Package className="mr-2 h-4 w-4" />
                                      <span>{product.name}</span>
                                  </CommandItem>
                              ))}
                          </CommandGroup>
                        )}
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
}
