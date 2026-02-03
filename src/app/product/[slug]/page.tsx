
'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import MainLayout from '@/components/main-layout';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Ruler, Hand } from 'lucide-react';
import { AddToCartForm } from './add-to-cart-form';
import { ReviewForm } from './review-form';
import type { Product, Review, ImagePlaceholder } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CustomSizeDialog } from './custom-size-dialog';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredImage, setFeaturedImage] = useState<ImagePlaceholder | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isCustomSizeDialogOpen, setCustomSizeDialogOpen] = useState(false);

  const reviewsCollection = useMemoFirebase(
    () => (product ? collection(firestore, `products/${product.id}/reviews`) : null),
    [product, firestore]
  );
  const reviewsQuery = useMemoFirebase(
      () => (reviewsCollection ? query(reviewsCollection, orderBy('createdAt', 'desc')) : null),
      [reviewsCollection]
  )
  const { data: reviews, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.slug || !firestore) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      const decodedSlug = decodeURIComponent(slug);
      
      try {
        const productsCollection = collection(firestore, 'products');
        const q = query(productsCollection, where('slug', '==', decodedSlug), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setProduct(null);
        } else {
          const productDoc = querySnapshot.docs[0];
          const productData = { id: productDoc.id, ...productDoc.data() } as Product;
          setProduct(productData);
          if (productData.images && productData.images.length > 0) {
            setFeaturedImage(productData.images[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug, firestore]);

  const averageRating = useMemo(() => {
      if (!reviews || reviews.length === 0) return 0;
      const total = reviews.reduce((acc, review) => acc + review.rating, 0);
      return total / reviews.length;
  }, [reviews]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };
  
  const handleAddToCart = (product: Product, quantity: number, size: string | null) => {
    if (!size) {
      toast({
        title: "Please select a size",
        description: "You need to choose a size before adding to the cart.",
        variant: "destructive"
      });
      return;
    }
    addToCart(product, quantity, size);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <Skeleton className="aspect-square w-full rounded-lg" />
                    </div>
                </div>
                <div className="flex flex-col pt-4 md:pt-8">
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-10 w-3/4 mb-4" />
                    <Skeleton className="h-8 w-1/3 mb-6" />
                    <Skeleton className="h-5 w-1/2 mb-8" />
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                         <Skeleton className="h-12 w-full" />
                    </div>
                     <Skeleton className="h-12 w-full mt-8" />
                </div>
            </div>
        </div>
      </MainLayout>
    );
  }

  if (!product || !featuredImage) {
    notFound();
  }

  const sizeChartData = [
    { size: 'S = 36', chest: 41.0, length: 40.0, shoulder: 18.0, toFitWaist: 30.0, bottomLength: 36.0 },
    { size: 'M = 38', chest: 43.0, length: 42.0, shoulder: 18.5, toFitWaist: 32.0, bottomLength: 37.0 },
    { size: 'L = 40', chest: 45.0, length: 42.0, shoulder: 19.0, toFitWaist: 34.0, bottomLength: 38.0 },
    { size: 'XL = 42', chest: 47.0, length: 44.0, shoulder: 19.5, toFitWaist: 36.0, bottomLength: 40.0 },
    { size: 'XXL = 44', chest: 49.0, length: 46.0, shoulder: 20.0, toFitWaist: 38.0, bottomLength: 42.0 },
    { size: 'XXXL = 46', chest: 51.0, length: 48.0, shoulder: 20.5, toFitWaist: 40.0, bottomLength: 44.0 },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <Image
                src={featuredImage.imageUrl}
                alt={featuredImage.description}
                fill
                priority
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
                data-ai-hint={featuredImage.imageHint}
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {product.images.map(image => (
                  <button 
                    key={image.id} 
                    onClick={() => setFeaturedImage(image)}
                    className={cn(
                      "relative aspect-square w-full overflow-hidden rounded-md transition-all duration-200",
                      "ring-offset-2 ring-offset-background focus:outline-none focus:ring-2",
                      featuredImage.id === image.id ? 'ring-2 ring-primary' : 'hover:opacity-80'
                    )}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      sizes="20vw"
                      data-ai-hint={image.imageHint}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-4 md:pt-8">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{product.category}</p>
            <h1 className="mt-2 font-headline text-3xl tracking-tight lg:text-4xl">{product.name.toUpperCase()}</h1>
            
            <p className="mt-4 font-sans text-2xl text-foreground">{formatPrice(product.price)}</p>
            <p className="text-xs text-muted-foreground mt-1">Tax included. Shipping calculated at checkout.</p>

            {/* Size Selector */}
            <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-foreground">Size</h3>
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
                                <Ruler className="h-4 w-4" />
                                Size Chart
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Size Chart (in inches)</DialogTitle>
                            </DialogHeader>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Size</TableHead>
                                  <TableHead>Chest</TableHead>
                                  <TableHead>Length</TableHead>
                                  <TableHead>Shoulder</TableHead>
                                  <TableHead>To Fit Waist</TableHead>
                                  <TableHead>Bottom Length</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sizeChartData.map((row) => (
                                  <TableRow key={row.size}>
                                    <TableCell className="font-medium">{row.size}</TableCell>
                                    <TableCell>{row.chest.toFixed(1)}</TableCell>
                                    <TableCell>{row.length.toFixed(1)}</TableCell>
                                    <TableCell>{row.shoulder.toFixed(1)}</TableCell>
                                    <TableCell>{row.toFitWaist.toFixed(1)}</TableCell>
                                    <TableCell>{row.bottomLength.toFixed(1)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                        </DialogContent>
                    </Dialog>
                </div>
                <ToggleGroup type="single" value={selectedSize || undefined} onValueChange={(value) => setSelectedSize(value || null)} className="justify-start gap-2">
                    {product.availableSizes?.map(size => (
                        <ToggleGroupItem key={size} value={size} aria-label={`Select size ${size}`} className="h-10 w-14 rounded-md border text-xs data-[state=on]:bg-gold data-[state=on]:text-white">
                            {size}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
            
             <Button
                variant="link"
                className="p-0 h-auto justify-start mt-4 text-muted-foreground"
                onClick={() => setCustomSizeDialogOpen(true)}
              >
                <Hand className="mr-2 h-4 w-4" />
                Request a custom size
              </Button>

            <div className="mt-8">
                <AddToCartForm 
                product={product} 
                selectedSize={selectedSize}
                onAddToCart={handleAddToCart}
                />
            </div>
            
            <Separator className="my-10" />

            <div className="prose prose-sm max-w-none text-muted-foreground">
                <h3 className="font-headline text-lg text-foreground mb-2">Description</h3>
              <p>{product.description}</p>
            </div>

            <Accordion type="single" collapsible className="w-full mt-8">
              <AccordionItem value="item-1">
                <AccordionTrigger>Returns & Exchanges</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day return and exchange policy. If you're not satisfied with your purchase, you can return it for a full refund or exchange it for a different size, provided the item is in its original, unworn condition with all tags attached.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Shipping Information</AccordionTrigger>
                <AccordionContent>
                  We provide free standard shipping on all orders over ₹5000. Express shipping options are available at checkout. Orders are typically processed within 1-2 business days. You will receive a confirmation email with tracking information once your order has shipped.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        </div>
        <Separator className="my-12 md:my-20" />

        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto">
            <h2 className="font-headline text-3xl mb-8 text-center">Customer Reviews</h2>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <div className="md:col-span-2">
                    {reviewsLoading && (
                        <div className="space-y-6">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    )}
                    {!reviewsLoading && reviews && reviews.length > 0 ? (
                        <div className="space-y-8">
                            {reviews.map(review => (
                                <div key={review.id} className="flex gap-4">
                                    <Avatar>
                                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">{review.userName}</h4>
                                            <span className="text-xs text-muted-foreground">{format(new Date(review.createdAt), 'PP')}</span>
                                        </div>
                                        <StarRating rating={review.rating}/>
                                        <p className="mt-2 text-muted-foreground">{review.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !reviewsLoading && <p className="text-muted-foreground text-center md:text-left">No reviews yet. Be the first to write one!</p>
                    )}
                </div>
                <div className="border-t pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                    <h3 className="font-headline text-2xl mb-4">Write a Review</h3>
                    {user ? (
                    <ReviewForm productId={product.id} />
                    ) : (
                    <p className="text-muted-foreground">Please <Link href="/login" className="underline">log in</Link> to write a review.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
      <CustomSizeDialog 
        isOpen={isCustomSizeDialogOpen} 
        onOpenChange={setCustomSizeDialogOpen}
        productName={product.name}
        user={user}
       />
    </MainLayout>
  );
}
