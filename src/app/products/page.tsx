
'use client';

import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const collectionImage = PlaceHolderImages.find(p => p.id === 'cosmos-collection');

export default function ProductsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
        {/* Women's Section */}
        <div className="group relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-10" />
          {collectionImage && (
             <Image
                src={collectionImage.imageUrl}
                alt="Shop Women's Wear"
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                data-ai-hint={collectionImage.imageHint}
             />
          )}
          <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/50" />
          <div className="relative z-20 text-center text-white">
            <h2 className="font-headline text-5xl tracking-tight">Women's</h2>
            <Button asChild variant="outline" className="mt-4 bg-transparent text-white border-white hover:bg-white hover:text-black">
              <Link href="/products/women">Shop Now</Link>
            </Button>
          </div>
        </div>

        {/* Men's Section */}
        <div className="group relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 z-10" />
           {collectionImage && (
             <Image
                src={collectionImage.imageUrl}
                alt="Shop Men's Wear"
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                data-ai-hint={collectionImage.imageHint}
             />
           )}
          <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/50" />
          <div className="relative z-20 text-center text-white">
            <h2 className="font-headline text-5xl tracking-tight">Men's</h2>
            <Button asChild variant="outline" className="mt-4 bg-transparent text-white border-white hover:bg-white hover:text-black">
              <Link href="/products/men">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
