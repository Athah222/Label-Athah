"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CreditCard, ShoppingBag, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createRazorpayOrder, verifyPayment, sendOrderConfirmationEmail } from "@/app/checkout/actions";
import type { Address, Coupon, ShippingAddress, Order, CartItem } from "@/lib/types";
import { collection, query, where, getDocs } from "firebase/firestore";
import { saveOrder } from "@/services/order-service";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const addressesCollection = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/shipping_addresses`) : null),
    [user, firestore]
  );
  const { data: addresses } = useCollection<ShippingAddress>(addressesCollection);

  const [isLoading, setIsLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (addresses) {
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
            setShippingAddress({
                name: defaultAddress.name,
                street: defaultAddress.street,
                city: defaultAddress.city,
                state: defaultAddress.state,
                zip: defaultAddress.zip,
                country: defaultAddress.country,
            });
        }
    }
  }, [addresses]);


  if (cartCount === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-24 text-center">
            <div className="inline-block rounded-full bg-secondary p-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h1 className="mt-8 font-headline text-4xl">Your Cart is Empty</h1>
            <p className="mt-4 text-lg text-muted-foreground">You can't checkout with an empty cart. Please add some products.</p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/">Continue Shopping</Link>
            </Button>
        </div>
      </MainLayout>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };
  
  const shippingCost = cartTotal > 5000 ? 0 : 50;
  const subtotal = cartTotal;
  const total = subtotal + shippingCost - discount;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [id]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!firestore || !couponCode) return;
    
    const couponsRef = collection(firestore, 'coupons');
    const q = query(couponsRef, where('code', '==', couponCode.toUpperCase()));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        toast({ title: 'Invalid Coupon', description: 'The coupon code you entered does not exist.', variant: 'destructive'});
        return;
      }

      const couponDoc = querySnapshot.docs[0];
      const couponData = { id: couponDoc.id, ...couponDoc.data() } as Coupon;

      if (!couponData.isActive || new Date().getTime() > couponData.expiresAt) {
        toast({ title: 'Expired Coupon', description: 'This coupon is no longer valid.', variant: 'destructive'});
        return;
      }
      
      setAppliedCoupon(couponData);

      let calculatedDiscount = 0;
      if (couponData.discountType === 'percentage') {
        calculatedDiscount = cartTotal * (couponData.discountValue / 100);
      } else {
        calculatedDiscount = couponData.discountValue;
      }
      setDiscount(calculatedDiscount);

      toast({ title: 'Coupon Applied', description: `You saved ${formatPrice(calculatedDiscount)}!`});

    } catch (error) {
      console.error("Error applying coupon:", error);
      toast({ title: 'Error', description: 'Could not apply coupon. Please try again.', variant: 'destructive'});
    }
  };
  
  const loadRazorpayScript = () => {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      }
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user || !firestore) {
        toast({ title: 'Authentication Error', description: 'You must be logged in to place an order.', variant: 'destructive'});
        router.push('/login');
        return;
    }
    
    const isAddressValid = Object.values(shippingAddress).every(field => field.trim() !== '');
    if(!isAddressValid) {
        toast({ title: 'Invalid Address', description: 'Please fill out all shipping address fields.', variant: 'destructive'});
        return;
    }

    setIsLoading(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast({ title: 'Payment Error', description: 'Could not load payment gateway. Please try again.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create Razorpay Order using Server Action
      const order = await createRazorpayOrder({ amount: total });

      // 2. Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Athah',
        description: 'Luxury Clothing Purchase',
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment signature on the server using Server Action
          const verificationResult = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verificationResult.success) {
            // 4. If signature is valid, create order in Firestore from the client
            try {
                const orderItems = cartItems.map(item => ({
                  id: item.id,
                  quantity: item.quantity,
                  size: item.size,
                  product: {
                      id: item.product.id,
                      name: item.product.name,
                      slug: item.product.slug,
                      description: item.product.description,
                      price: item.product.price,
                      images: item.product.images,
                      category: item.product.category,
                      stock: item.product.stock,
                      availableSizes: item.product.availableSizes || [],
                  }
                }));

                const orderData: Omit<Order, 'id'> = {
                    userId: user.uid,
                    items: orderItems,
                    total: total,
                    shippingAddress: shippingAddress,
                    billingAddress: shippingAddress,
                    status: 'Processing',
                    createdAt: Date.now(),
                    razorpay_paymentId: response.razorpay_payment_id,
                    razorpay_orderId: response.razorpay_order_id,
                };
                
                const newOrderId = await saveOrder(firestore, user.uid, orderData);

                // 5. Send Confirmation Email (Async call, don't wait if not critical)
                sendOrderConfirmationEmail({
                  orderId: newOrderId,
                  customerName: shippingAddress.name,
                  customerEmail: user.email!,
                  totalAmount: total,
                  items: orderItems.map(i => ({
                    name: i.product.name,
                    quantity: i.quantity,
                    price: i.product.price,
                    size: i.size
                  }))
                }).catch(err => console.error("Email confirmation failed to trigger:", err));

                toast({ title: 'Payment Successful!', description: 'Your order has been placed. An email confirmation has been sent.' });
                clearCart();
                router.push(`/account/orders/${newOrderId}`);

            } catch(e) {
                 toast({ title: 'Order Creation Failed', description: 'Payment was successful but we could not save your order. Please contact support.', variant: 'destructive' });
            }
          } else {
            toast({ title: 'Payment Failed', description: verificationResult.message, variant: 'destructive' });
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: user.email,
          contact: ''
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}`,
        },
        theme: {
          color: '#cab973'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment processing error:', error);
      toast({ title: 'Error', description: 'Something went wrong while processing the payment.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 font-headline text-4xl text-center">Checkout</h1>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left side: Order Summary */}
          <div className="lg:row-start-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">Order Summary ({cartCount} items)</h2>
                 <Accordion type="single" collapsible className="w-full mt-4">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Show order details</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {cartItems.map(item => (
                           <div key={item.id} className="flex items-center gap-4">
                             <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                               <Image src={item.product.images[0].imageUrl} alt={item.product.name} fill className="object-cover" />
                               <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{item.quantity}</span>
                             </div>
                             <div className="flex-1">
                               <h3 className="text-sm font-medium">{item.product.name}</h3>
                               <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                             </div>
                             <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                           </div>
                         ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCost > 0 ? formatPrice(shippingCost) : "Free"}</span>
                  </div>
                   {discount > 0 && (
                     <div className="flex justify-between text-green-600">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Tag className="h-4 w-4"/> Coupon Applied ({appliedCoupon?.code})
                        </span>
                        <span>- {formatPrice(discount)}</span>
                    </div>
                   )}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                 <div className="mt-4">
                    <Label htmlFor="coupon">Coupon Code</Label>
                    <div className="flex gap-2 mt-1">
                        <Input 
                          id="coupon" 
                          placeholder="FESTIVE15" 
                          value={couponCode} 
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={!!appliedCoupon}
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleApplyCoupon}
                          disabled={!!appliedCoupon || !couponCode}
                        >
                          Apply
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side: Forms */}
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" value={shippingAddress.name} onChange={handleAddressChange} required/>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="street">Address</Label>
                    <Input id="street" placeholder="123 Luxury Lane" value={shippingAddress.street} onChange={handleAddressChange} required/>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Metropolis" value={shippingAddress.city} onChange={handleAddressChange} required/>
                  </div>
                   <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="NY" value={shippingAddress.state} onChange={handleAddressChange} required/>
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" placeholder="10001" value={shippingAddress.zip} onChange={handleAddressChange} required/>
                  </div>
                   <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={shippingAddress.country} onChange={handleAddressChange} required disabled/>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">Payment</h2>
                 <p className="text-sm text-muted-foreground mt-2">Secure payment powered by Razorpay.</p>
                <div className="mt-4">
                  <Button size="lg" className="w-full" onClick={handlePayment} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <CreditCard className="mr-2 h-5 w-5"/>}
                    {isLoading ? 'Processing...' : `Pay ${formatPrice(total)} with Razorpay`}
                  </Button>
                  <p className="mt-4 text-center text-xs text-muted-foreground">You will be redirected to Razorpay to complete your purchase securely.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}