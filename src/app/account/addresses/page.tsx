'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreVertical, Home, Trash2, Edit, Star } from 'lucide-react';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import type { ShippingAddress } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressDialog } from './address-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function AddressesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const addressesCollection = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/shipping_addresses`) : null),
    [user, firestore]
  );
  const { data: addresses, isLoading } = useCollection<ShippingAddress>(addressesCollection);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<ShippingAddress | null>(null);

  const handleAddAddress = () => {
    setSelectedAddress(undefined);
    setDialogOpen(true);
  };

  const handleEditAddress = (address: ShippingAddress) => {
    setSelectedAddress(address);
    setDialogOpen(true);
  };

  const confirmDeleteAddress = (address: ShippingAddress) => {
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAddress = () => {
    if (!addressToDelete || !user || !firestore) return;

    if (addressToDelete.isDefault && addresses && addresses.length > 1) {
        toast({
            variant: 'destructive',
            title: 'Cannot Delete Default Address',
            description: 'Please set another address as default before deleting this one.',
        });
        setDeleteDialogOpen(false);
        return;
    }

    const addressDocRef = doc(firestore, `users/${user.uid}/shipping_addresses`, addressToDelete.id);
    deleteDocumentNonBlocking(addressDocRef);
    toast({ title: 'Address Deleted', description: 'The address has been removed.' });
    
    setDeleteDialogOpen(false);
    setAddressToDelete(null);
  };

  const handleSetDefault = async (addressToMakeDefault: ShippingAddress) => {
    if (!user || !firestore || !addresses) return;

    const batch = writeBatch(firestore);
    const currentDefault = addresses.find(addr => addr.isDefault);

    // Unset the current default if it exists and is not the one we're setting
    if (currentDefault && currentDefault.id !== addressToMakeDefault.id) {
        const currentDefaultRef = doc(firestore, `users/${user.uid}/shipping_addresses`, currentDefault.id);
        batch.update(currentDefaultRef, { isDefault: false });
    }

    // Set the new default
    const newDefaultRef = doc(firestore, `users/${user.uid}/shipping_addresses`, addressToMakeDefault.id);
    batch.update(newDefaultRef, { isDefault: true });

    try {
        await batch.commit();
        toast({ title: 'Default Address Updated', description: 'Your preferred shipping address has been set.' });
    } catch (error) {
        console.error("Error setting default address: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update default address.' });
    }
  };

  return (
    <>
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-headline text-4xl">My Addresses</h1>
            <Button onClick={handleAddAddress}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
          )}
          
          {!isLoading && addresses && addresses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {addresses.map(address => (
                <Card key={address.id} className={address.isDefault ? 'border-primary' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{address.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           {!address.isDefault && (
                             <DropdownMenuItem onClick={() => handleSetDefault(address)}>
                               <Star className="mr-2 h-4 w-4" /> Set as Default
                             </DropdownMenuItem>
                           )}
                          <DropdownMenuItem onClick={() => handleEditAddress(address)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDeleteAddress(address)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardTitle>
                     {address.isDefault && <Badge variant="secondary" className="w-fit">Default</Badge>}
                  </CardHeader>
                  <CardContent>
                    <address className="not-italic text-muted-foreground">
                      {address.street}<br />
                      {address.city}, {address.state} {address.zip}<br />
                      {address.country}
                    </address>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             !isLoading && (
                 <div className="text-center p-12 text-muted-foreground flex flex-col items-center rounded-lg border-2 border-dashed">
                    <Home className="h-12 w-12 mb-4"/>
                    <h2 className="text-xl font-semibold text-foreground mb-2">No addresses saved</h2>
                    <p>Add a shipping address to make checkout faster.</p>
                </div>
             )
          )}
        </div>
      </MainLayout>
      
      <AddressDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        address={selectedAddress}
        userId={user?.uid}
        hasAddresses={!!(addresses && addresses.length > 0)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this address. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddress} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
