'use client';
import { useMemo } from 'react';
import { File, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const ordersQuery = useMemoFirebase(
        () => firestore ? query(collectionGroup(firestore, 'orders')) : null,
        [firestore]
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
    
    const handleRowClick = (order: Order) => {
        router.push(`/admin/orders/${order.id}?userId=${order.userId}`);
    }

    const handleExport = () => {
        if (!orders || orders.length === 0) {
            toast({
                title: "No data to export",
                description: "There are no orders available to export.",
                variant: "destructive"
            });
            return;
        }

        const headers = ["Order ID", "Customer Name", "Date", "Status", "Total Amount", "Payment ID"];
        const csvRows = orders.map(order => [
            `#${order.id.toUpperCase()}`,
            `"${order.shippingAddress.name.replace(/"/g, '""')}"`,
            `"${format(new Date(order.createdAt), 'PPpp')}"`,
            order.status,
            order.total,
            order.razorpay_paymentId || 'N/A'
        ]);

        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `athah-orders-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: "Export Successful", description: "CSV report has been generated." });
    };

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center py-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered" className="hidden sm:flex">
            Delivered
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Fulfilled
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Declined</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Refunded</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Manage your customer orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><div className="flex justify-end"><Skeleton className="h-6 w-16" /></div></TableCell>
                    </TableRow>
                ))}
                {!isLoading && orders?.map(order => (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => handleRowClick(order)}>
                        <TableCell className="font-medium">#{order.id.substring(0, 6).toUpperCase()}</TableCell>
                        <TableCell>{order.shippingAddress.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{format(new Date(order.createdAt), 'PP')}</TableCell>
                        <TableCell className="hidden md:table-cell">
                            <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                    </TableRow>
                ))}
                {!isLoading && !orders?.length && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No orders found.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
