
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeProductCard } from '@/components/home-product-card';
import MainLayout from '@/components/main-layout';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Instagram, Facebook } from 'lucide-react';
import { useEffect, useState } from 'react';

// SVG for Pinterest Icon
const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.31 15.25c-1.12 0-2.22-.39-3.03-1.14-.8-.75-1.2-1.8-1.2-2.92 0-1.74.87-3.23 2.18-4.04.53-.33.72-.99.46-1.52-.25-.53-.87-.73-1.4-.48-1.7.83-2.78 2.5-2.78 4.47 0 1.63.7 3.1 1.85 4.14 1.15 1.04 2.67 1.6 4.3 1.6 2.8 0 4.96-1.93 4.96-4.81 0-2.31-1.35-3.69-3.05-3.69-1.1 0-1.86.83-1.86 1.83 0 .7.26 1.17.65 1.5.39.33.43.59.16.99-.34.5-.83.6-1.34.46-1.2-.35-1.95-1.48-1.95-2.72 0-1.9 1.48-3.53 3.61-3.53 2.65 0 4.54 2.02 4.54 4.92 0 3.32-2.02 5.56-5.11 5.56z" />
    </svg>
);


export default function HomePage() {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const journeyImage = PlaceHolderImages.find(p => p.id === 'sale-background');
  const athahImage = PlaceHolderImages.find(p => p.id === 'athah-brand-story');
  const cosmosImage = PlaceHolderImages.find(p => p.id === 'cosmos-collection');

  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products'), limit(4)), [firestore]);
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${offsetY * 0.5}px)` }}
        >
          <Image 
            src="/herobg1.png" 
            alt="Elegant background showcasing Athah's aesthetic" 
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 text-white px-4">
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.5)'}}>
              Endless blend of Tradition and Trend
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-200">
                Discover timeless pieces where heritage meets contemporary sophistication.
            </p>
            <Button asChild size="lg" className="mt-8 bg-white text-black hover:bg-gray-200">
                <Link href="/products">Shop The Collection</Link>
            </Button>
        </div>
      </section>
      
      {/* ATHAH Story Section */}
      <section className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
                {athahImage && (
                    <Image 
                        src={athahImage.imageUrl} 
                        alt={athahImage.description} 
                        fill 
                        className="object-cover" 
                        data-ai-hint={athahImage.imageHint} 
                    />
                )}
            </div>
            <div className="text-left md:pl-12">
              <h2 className="font-headline text-5xl md:text-6xl text-primary">ATHAH</h2>
              <p className="mt-4 text-lg text-muted-foreground">A new beginning.<br />A bloom shaped from chaos into clarity.</p>
              <p className="mt-6 text-foreground">Handloom stories, handcrafted from life’s little moments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 
          COSMOS Collection Section 
          IDEAL IMAGE DIMENSIONS: 1920x1080px (16:9 ratio). 
          For parallax movement, 1920x1200px is recommended to prevent gaps.
      */}
      <section className="relative py-40 bg-gray-900 overflow-hidden text-white">
        {cosmosImage && (
            <div 
                className="absolute inset-0 z-0"
                style={{ transform: `translateY(${offsetY * 0.2 - 100}px) scale(1.1)` }}
            >
                <Image 
                    src={cosmosImage.imageUrl} 
                    alt={cosmosImage.description} 
                    fill 
                    className="object-cover" 
                    data-ai-hint={cosmosImage.imageHint}
                />
            </div>
        )}
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 text-center container mx-auto px-4">
            <h2 className="font-headline text-5xl md:text-6xl">COSMOS</h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">Where space becomes stitch.</p>
            <p className="mt-6 text-white/90 max-w-2xl mx-auto">Zari, maggam, cutwork — constellations shaped by hand.</p>
            <Button asChild variant="outline" className="mt-8 bg-transparent border-white text-white hover:bg-white hover:text-black">
                <Link href="/products">Explore COSMOS</Link>
            </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-20 sm:py-28 bg-background">
        <div className="container mx-auto px-4">
           <div className="text-center mb-16">
             <p className="text-sm uppercase tracking-widest text-muted-foreground">Handpicked For You</p>
             <h2 className="font-headline text-4xl mt-2">Featured Collection</h2>
           </div>
           {isLoading && (
           <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full bg-muted" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        )}
          {!isLoading && products && (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <HomeProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
           <div className="text-center mt-16">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">Explore All Products</Link>
            </Button>
          </div>
        </div>
      </section>
      
       {/* Follow our Journey Section */}
      <section className="relative py-40 bg-primary/5">
        {journeyImage && <Image src={journeyImage.imageUrl} alt={journeyImage.description} fill className="object-cover object-center" data-ai-hint={journeyImage.imageHint} />}
        <div className="absolute inset-0 bg-black/50"/>
        <div className="relative z-10 text-center container mx-auto px-4 text-white">
            <h2 className="font-headline text-5xl md:text-6xl">Follow Our Journey</h2>
            <p className="text-white/80 max-w-2xl mx-auto mt-4">
                Become a part of the Athah story. Follow us on social media for behind-the-scenes content, new arrivals, and style inspiration.
            </p>
            <div className="flex justify-center gap-6 mt-8">
              <Link href="#" className="text-white hover:text-primary transition-colors"><Instagram className="h-7 w-7"/></Link>
              <Link href="#" className="text-white hover:text-primary transition-colors"><Facebook className="h-7 w-7"/></Link>
              <Link href="#" className="text-white hover:text-primary transition-colors"><PinterestIcon className="h-7 w-7"/></Link>
            </div>
        </div>
      </section>

    </MainLayout>
  );
}
