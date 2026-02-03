'use client';

import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { collection } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'orders') : null),
    [user, firestore]
  );
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-headline text-4xl mb-8">My Orders</h1>
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View the status and details of your past orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead><span className="sr-only">View</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><div className="flex justify-end"><Skeleton className="h-6 w-16" /></div></TableCell>
                            <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8" /></div></TableCell>
                        </TableRow>
                    ))
                )}
                {!isLoading && orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="hidden sm:table-cell font-medium">#{order.id.substring(0, 6).toUpperCase()}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={order.items.map(item => item.product.name).join(', ')}>
                      {order.items.map(item => item.product.name).join(', ')}
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="ghost" size="icon">
                         <Link href={`/account/orders/${order.id}`}>
                           <ArrowRight className="h-4 w-4" />
                           <span className="sr-only">View Order</span>
                         </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {!isLoading && (!orders || orders.length === 0) && (
                <div className="text-center p-8 text-muted-foreground flex flex-col items-center">
                    <ShoppingBag className="h-12 w-12 mb-4"/>
                    <p>You haven't placed any orders yet.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
