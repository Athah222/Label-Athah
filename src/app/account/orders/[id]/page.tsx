
'use client';
import { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import MainLayout from '@/components/main-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function OrderDetailsPage() {
  const params = useParams();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const orderDocRef = useMemoFirebase(
      () => (user && params.id ? doc(firestore, `users/${user.uid}/orders`, params.id as string) : null),
      [user, firestore, params.id]
  );
  const { data: order, isLoading: isOrderLoading } = useDoc<Order>(orderDocRef);

  if (isUserLoading || isOrderLoading) {
      return (
        <MainLayout>
            <div className="container mx-auto px-4 py-12">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-12 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3 mb-8" />

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4 py-4"><Skeleton className="h-24 w-24" /><div className="space-y-2 flex-1"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/4" /></div><Skeleton className="h-6 w-1/4" /></div>
                                <div className="flex gap-4 py-4"><Skeleton className="h-24 w-24" /><div className="space-y-2 flex-1"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/4" /></div><Skeleton className="h-6 w-1/4" /></div>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Separator/>
                                <div className="space-y-2"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
                                <Separator/>
                                <div className="space-y-2"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div>
                                <Separator/>
                                <Skeleton className="h-8 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
      )
  }

  if (!order) {
    notFound();
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': return 'secondary';
      case 'Processing': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const shippingCost = order.total > 5000 ? 0 : 50;
  const subtotal = order.total - shippingCost;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/account/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
                </Link>
            </Button>
            <h1 className="font-headline text-4xl">Order Details</h1>
            <p className="text-muted-foreground">Order ID: #{order.id.substring(0, 6).toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col divide-y">
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-4 py-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        <Image src={item.product.images[0].imageUrl} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">Price: {formatPrice(item.product.price)}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span>Status</span>
                    <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                </div>
                <Separator/>
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <address className="not-italic text-sm text-muted-foreground">
                    {order.shippingAddress.name}<br/>
                    {order.shippingAddress.street}<br/>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br/>
                    {order.shippingAddress.country}
                  </address>
                </div>
                <Separator/>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{formatPrice(shippingCost)}</span>
                    </div>
                </div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
