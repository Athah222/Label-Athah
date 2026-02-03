'use client';

import { useMemo, useState } from 'react';
import Link from "next/link";
import { ArrowUpRight, CreditCard, Users, Package, DollarSign, ListFilter, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query } from 'firebase/firestore';
import type { Order, Product, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    // Fetch data for statistics
    const ordersCollection = useMemoFirebase(() => collectionGroup(firestore, 'orders'), [firestore]);
    const { data: allOrders, isLoading: ordersLoading } = useCollection<Order>(ordersCollection);

    const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: allUsers, isLoading: usersLoading } = useCollection<User>(usersCollection);

    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: allProducts, isLoading: productsLoading } = useCollection<Product>(productsCollection);

    // Derived statistics
    const stats = useMemo(() => {
        if (!allOrders || !allUsers || !allProducts) return null;

        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = allOrders.length;
        const totalCustomers = allUsers.length;
        const totalStock = allProducts.reduce((sum, prod) => sum + (prod.stock || 0), 0);

        return {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalStock
        };
    }, [allOrders, allUsers, allProducts]);

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
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(price);
    };

    const handleRowClick = (order: Order) => {
        router.push(`/admin/orders/${order.id}?userId=${order.userId}`);
    };

    const handleExport = () => {
        if (!allOrders || allOrders.length === 0) {
            toast({
                title: "No data to export",
                description: "There are no orders available to export at this time.",
                variant: "destructive"
            });
            return;
        }

        const headers = ["Order ID", "Customer Name", "Date", "Status", "Total Amount", "Payment ID", "Order ID (Razorpay)"];
        const csvRows = allOrders.map(order => [
            `#${order.id.toUpperCase()}`,
            `"${order.shippingAddress.name.replace(/"/g, '""')}"`,
            `"${format(new Date(order.createdAt), 'PPpp')}"`,
            order.status,
            order.total,
            order.razorpay_paymentId || 'N/A',
            order.razorpay_orderId || 'N/A'
        ]);

        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `athah-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: "Export Successful",
            description: "Your order report has been downloaded.",
        });
    };

    const isLoading = ordersLoading || usersLoading || productsLoading;

    // Filter orders for the table tabs
    const filteredOrders = (status?: string) => {
        if (!allOrders) return [];
        let list = [...allOrders].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        if (status) {
            list = list.filter(o => o.status.toLowerCase() === status.toLowerCase());
        }
        return list;
    };

    return (
        <div className="flex flex-col gap-8 py-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Gross earnings from all orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Registered user accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Lifetime order count</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold">{stats?.totalStock || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Available inventory units</p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Management Section */}
            <Tabs defaultValue="all">
                <div className="flex items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="all">All Orders</TabsTrigger>
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
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem checked>Recent First</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>High Value</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                        </Button>
                    </div>
                </div>

                {['all', 'processing', 'shipped', 'delivered'].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="capitalize">{tab} Orders</CardTitle>
                                <CardDescription>
                                    View and manage your {tab === 'all' ? '' : tab} customer orders.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="hidden md:table-cell">Date</TableHead>
                                            <TableHead className="hidden md:table-cell">Status</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                                                    <TableCell><div className="flex justify-end"><Skeleton className="h-6 w-16" /></div></TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            filteredOrders(tab === 'all' ? undefined : tab).map(order => (
                                                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(order)}>
                                                    <TableCell className="font-medium">#{order.id.substring(0, 6).toUpperCase()}</TableCell>
                                                    <TableCell>{order.shippingAddress.name}</TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {format(new Date(order.createdAt), 'PP')}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge variant={getStatusVariant(order.status) as any}>
                                                            {order.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                        {!isLoading && filteredOrders(tab === 'all' ? undefined : tab).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    No orders found in this category.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
