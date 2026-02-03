
"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, cartCount } = useCart();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  if (cartCount === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-24 text-center">
            <div className="inline-block rounded-full bg-secondary p-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h1 className="mt-8 font-headline text-4xl">Your Cart is Empty</h1>
            <p className="mt-4 text-lg text-muted-foreground">Explore our collections and find something you love.</p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/">Continue Shopping</Link>
            </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-headline text-4xl tracking-tight">Your Cart</h1>
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex flex-col divide-y divide-border">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-6 py-6">
                  <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={item.product.images[0].imageUrl} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Price: {formatPrice(item.product.price)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input readOnly value={item.quantity} className="h-8 w-12 text-center" />
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                      </div>
                       <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                   <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-muted-foreground">Calculated at next step</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
