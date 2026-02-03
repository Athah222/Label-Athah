'use client';

import { useMemo, useState } from 'react';
import { useParams, useSearchParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ChevronDown, User, Truck, Package, Mail, CreditCard, Copy, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Order, User as UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { sendShippingNotificationEmail } from '@/app/checkout/actions';

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const orderId = params.id as string;
  const userId = searchParams.get('userId');

  const orderDocRef = useMemoFirebase(
    () => (userId && orderId ? doc(firestore, `users/${userId}/orders`, orderId) : null),
    [userId, orderId, firestore]
  );
  const { data: order, isLoading: isOrderLoading } = useDoc<Order>(orderDocRef);

  // Fetch the customer's user profile
  const userDocRef = useMemoFirebase(
    () => (userId ? doc(firestore, 'users', userId) : null),
    [userId, firestore]
  );
  const { data: customer, isLoading: isCustomerLoading } = useDoc<UserProfile>(userDocRef);

  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!orderDocRef || !order || newStatus === order.status) return;

    setIsUpdating(true);
    try {
      await updateDoc(orderDocRef, { status: newStatus });
      
      // If status is changed to Shipped, send an automated notification email
      if (newStatus === 'Shipped') {
        const emailToUse = customer?.email || (userId?.includes('@') ? userId : null);
        
        if (emailToUse) {
          sendShippingNotificationEmail({
            orderId: order.id,
            customerName: customer?.displayName || order.shippingAddress.name || 'Valued Customer',
            customerEmail: emailToUse,
          }).catch(err => console.error("Shipping email failed to trigger:", err));
        }
      }

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Failed to update status: ", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the order status.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this into your email client.",
    });
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  if (isOrderLoading) {
    return (
      <div className="py-4">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-6 w-1/3 mb-8" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent className="space-y-4"><div className="flex gap-4 py-4"><Skeleton className="h-24 w-24" /><div className="space-y-2 flex-1"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/4" /></div><Skeleton className="h-6 w-1/4" /></div></CardContent></Card>
          </div>
          <div className="space-y-8">
            <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    if (!isOrderLoading && (orderId && userId)) {
      notFound();
    }
    return null;
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': return 'secondary';
      case 'Processing': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  const emailSubject = `Shipping Details for Your Athah Order #${order.id.substring(0, 6).toUpperCase()}`;
  const emailBody = `Dear ${customer?.displayName || order.shippingAddress.name || 'Valued Customer'},

Thank you for shopping with Athah. Following our previous notification, we are pleased to share the specific shipping details for your order #${order.id.substring(0, 6).toUpperCase()}.

Carrier: [ENTER CARRIER NAME]
Tracking Number: [ENTER TRACKING NUMBER]
Tracking Link: [ENTER TRACKING LINK]

You can use these details to monitor the progress of your delivery. If you have any questions, feel free to reach out to us at label.athah910@gmail.com.

We hope you love your new Athah pieces!

Warm regards,
Team Athah`;

  return (
    <div className="py-4">
      <div className="mb-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
        <h1 className="text-2xl font-bold">Order #{order.id.substring(0, 6).toUpperCase()}</h1>
        <p className="text-sm text-muted-foreground">Placed on {format(new Date(order.createdAt), 'PPpp')}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Items & Email Template */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered ({order.items.reduce((acc, item) => acc + item.quantity, 0)})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image src={item.product.images[0]?.imageUrl || '/placeholder.svg'} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-sm text-muted-foreground">Price: {formatPrice(item.product.price)}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Email Template Card (Visible only when Shipped) */}
          {order.status === 'Shipped' && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Mail className="h-5 w-5" /> Shipping Info Template
                    </CardTitle>
                    <CardDescription>
                      Copy this template to send detailed tracking information to the customer manually.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-2" 
                      onClick={() => copyToClipboard(emailSubject, 'subject')}
                    >
                      {copiedField === 'subject' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      <span className="text-xs">Copy Subject</span>
                    </Button>
                  </div>
                  <div className="rounded-md border bg-background p-3 text-sm font-medium">
                    {emailSubject}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Body</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-2" 
                      onClick={() => copyToClipboard(emailBody, 'body')}
                    >
                      {copiedField === 'body' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      <span className="text-xs">Copy Body</span>
                    </Button>
                  </div>
                  <div className="rounded-md border bg-background p-4 text-sm whitespace-pre-wrap leading-relaxed min-h-[300px]">
                    {emailBody}
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100 text-yellow-800 text-xs">
                  <Package className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Remember to replace the <strong>[ENTER...]</strong> placeholders with the actual tracking data before sending.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Summaries & Customer Info */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-muted-foreground uppercase tracking-wider text-xs">Current Status</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 w-40 justify-between" disabled={isUpdating}>
                                <Badge variant={getStatusVariant(order.status) as any} className="pointer-events-none">{order.status}</Badge>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleStatusChange('Processing')}>Processing</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('Shipped')}>Shipped</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('Delivered')}>Delivered</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('Cancelled')} className="text-destructive">Cancelled</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Separator/>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Payment ID</span>
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{order.razorpay_paymentId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Order ID (RXP)</span>
                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{order.razorpay_orderId || 'N/A'}</span>
                    </div>
                </div>
                <Separator/>
                <div className="flex justify-between items-center pt-2">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold text-xl text-primary">{formatPrice(order.total)}</span>
                </div>
            </CardContent>
          </Card>
          
          {/* Customer Account Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Customer Account
              </CardTitle>
            </CardHeader>
            <CardContent>
                {isCustomerLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : customer ? (
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-base">{customer.displayName || 'No name in profile'}</p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </p>
                    {customer.role && (
                        <Badge variant="outline" className="mt-2 capitalize text-[10px] h-5">{customer.role}</Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Profile details unavailable</p>
                )}
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
                <address className="not-italic text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground text-base mb-1">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                </address>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
