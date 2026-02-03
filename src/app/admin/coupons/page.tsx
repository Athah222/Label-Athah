
'use client';

import { PlusCircle, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from "firebase/firestore";
import type { Coupon } from "@/lib/types";
import { CouponDialog } from "./coupon-dialog";

export default function AdminCouponsPage() {
    const firestore = useFirestore();
    const couponsCollection = useMemoFirebase(() => collection(firestore, 'coupons'), [firestore]);
    const { data: coupons, isLoading } = useCollection<Coupon>(couponsCollection);
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

    const { toast } = useToast();

    const formatValue = (coupon: Coupon) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}%`;
        }
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(coupon.discountValue);
    };

    const handleAddCoupon = () => {
        setSelectedCoupon(undefined);
        setDialogOpen(true);
    };

    const handleEditCoupon = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setDialogOpen(true);
    };

    const confirmDeleteCoupon = (coupon: Coupon) => {
        setCouponToDelete(coupon);
        setDeleteDialogOpen(true);
    };

    const handleDeleteCoupon = () => {
        if (couponToDelete && firestore) {
            const couponDocRef = doc(firestore, 'coupons', couponToDelete.id);
            deleteDocumentNonBlocking(couponDocRef);
            toast({ title: "Coupon Deleted", description: `Coupon ${couponToDelete.code} has been deleted.` });
        }
        setDeleteDialogOpen(false);
        setCouponToDelete(null);
    };

    const isCouponActive = (coupon: Coupon) => {
        const now = new Date().getTime();
        return coupon.isActive && coupon.expiresAt > now;
    }

  return (
    <>
        <div className="py-4">
        <div className="flex items-center justify-between mb-4">
            <div>
            <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
            <p className="text-muted-foreground">
                Manage your promotional codes.
            </p>
            </div>
            <Button onClick={handleAddCoupon}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Coupon
            </Button>
        </div>
        <Card>
            <CardContent className="mt-6">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && coupons?.map((coupon) => {
                    const active = isCouponActive(coupon);
                    return (
                        <TableRow key={coupon.id}>
                            <TableCell className="font-medium">{coupon.code}</TableCell>
                            <TableCell className="capitalize">{coupon.discountType}</TableCell>
                            <TableCell>{formatValue(coupon)}</TableCell>
                            <TableCell>
                                <Badge variant={active ? 'default' : 'destructive'}>
                                {active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(coupon.expiresAt, 'PP')}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => confirmDeleteCoupon(coupon)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
                </TableBody>
            </Table>
            {!isLoading && !coupons?.length && (
                <div className="text-center p-8 text-muted-foreground">
                    No coupons found. Add your first coupon to get started.
                </div>
            )}
            </CardContent>
        </Card>
        </div>

        <CouponDialog 
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
            coupon={selectedCoupon}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this coupon?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the coupon code.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCoupon} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
