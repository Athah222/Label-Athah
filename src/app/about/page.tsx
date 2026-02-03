'use client';

import Image from 'next/image';
import MainLayout from '@/components/main-layout';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  const brandStoryImage = PlaceHolderImages.find(p => p.id === 'athah-brand-story');
  const craftsmanshipImage = PlaceHolderImages.find(p => p.id === 'silk-saree-2');
  const textureImage = PlaceHolderImages.find(p => p.id === 'mens-collection-bg');
  const eleganceImage = PlaceHolderImages.find(p => p.id === 'silk-saree-1');

  return (
    <MainLayout>
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
          {textureImage && (
            <Image
              src={textureImage.imageUrl}
              alt="Linen texture background"
              fill
              className="object-cover opacity-30"
              priority
            />
          )}
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="font-headline text-6xl md:text-8xl tracking-tight text-primary">Our Story</h1>
            <p className="mt-8 text-xl md:text-3xl text-muted-foreground font-light italic">
              &ldquo;A new beginning. A bloom shaped from chaos into clarity.&rdquo;
            </p>
          </div>
        </section>

        {/* The Beginning */}
        <section className="py-24 md:py-40">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                {brandStoryImage && (
                  <Image
                    src={brandStoryImage.imageUrl}
                    alt="Bloom abstract"
                    fill
                    className="object-cover"
                    data-ai-hint={brandStoryImage.imageHint}
                  />
                )}
              </div>
              <div className="space-y-10">
                <h2 className="font-headline text-5xl md:text-7xl text-foreground">ATHAH</h2>
                <div className="space-y-8 text-xl text-muted-foreground leading-relaxed font-light">
                  <p>
                    Athah is more than just a label; it is a philosophy. Born from the desire to find beauty in the intricate, our journey began with a simple vision: to create clothing that resonates with the soul.
                  </p>
                  <p>
                    Like a flower blooming amidst the vastness, Athah represents that precise moment where chaos transforms into clarity. We believe that every garment should tell a story&mdash;one of heritage, patience, and meticulous skill.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Craftsmanship Banner */}
        <section className="bg-secondary/40 py-32">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h3 className="font-headline text-4xl mb-8 italic text-primary">Handloom Stories</h3>
            <p className="text-2xl text-muted-foreground leading-relaxed font-light">
              We celebrate the hands that weave. Our collections are a tribute to traditional handloom techniques, handcrafted from life&rsquo;s little moments and woven into timeless silhouettes.
            </p>
            <Separator className="my-16 bg-primary/30 mx-auto w-32 h-1" />
          </div>
        </section>

        {/* Visual Storytelling */}
        <section className="py-24 md:py-40 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-10 py-12">
                <h2 className="font-headline text-5xl">The Art of the Stitch</h2>
                <p className="text-xl text-muted-foreground leading-relaxed font-light">
                  From the shimmering threads of zari to the precision of cutwork, every detail in an Athah piece is intentional. We blend the richness of ancient traditions with the clean lines of contemporary design, creating an endless blend of tradition and trend.
                </p>
                <div className="relative aspect-video rounded-2xl overflow-hidden group shadow-xl">
                  {craftsmanshipImage && (
                    <Image
                      src={craftsmanshipImage.imageUrl}
                      alt="Embroidery detail"
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      data-ai-hint={craftsmanshipImage.imageHint}
                    />
                  )}
                </div>
              </div>
              <div className="flex-1 relative aspect-[3/4] md:aspect-auto rounded-2xl overflow-hidden shadow-2xl">
                {eleganceImage && (
                  <Image
                    src={eleganceImage.imageUrl}
                    alt="Ethereal elegance"
                    fill
                    className="object-cover"
                    data-ai-hint={eleganceImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="py-32 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-headline text-5xl md:text-7xl mb-10">Timeless Elegance, Redefined.</h2>
            <p className="text-2xl opacity-90 leading-relaxed font-light">
              Our mission is to empower the discerning individual with pieces that transcend seasons. In a world of fast fashion, we choose the path of slow, meaningful creation. We invite you to join us in this journey of elegance, heritage, and clarity.
            </p>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
