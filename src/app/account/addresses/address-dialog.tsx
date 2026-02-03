'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { ShippingAddress } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface AddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  address?: ShippingAddress;
  userId?: string;
  hasAddresses: boolean;
}

const addressFormSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  street: z.string().min(5, 'Street address is required.'),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State is required.'),
  zip: z.string().min(5, 'ZIP code is required.'),
  country: z.string().min(2, 'Country is required.'),
  isDefault: z.boolean(),
});

export function AddressDialog({ isOpen, onOpenChange, address, userId, hasAddresses }: AddressDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'India',
      isDefault: !hasAddresses,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (address) {
        form.reset({ ...address });
      } else {
        form.reset({
          name: '',
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'India',
          isDefault: !hasAddresses,
        });
      }
    }
  }, [isOpen, address, form, hasAddresses]);
  
  async function onSubmit(values: z.infer<typeof addressFormSchema>) {
    if (!firestore || !userId) return;

    const addressData = {
        userId,
        ...values,
    };

    const addressesCollection = collection(firestore, `users/${userId}/shipping_addresses`);

    try {
        const batch = writeBatch(firestore);

        // If setting this address as default, unset other defaults
        if (values.isDefault) {
            const querySnapshot = await getDocs(addressesCollection);
            querySnapshot.forEach(docSnap => {
                if (docSnap.exists() && docSnap.data().isDefault && docSnap.id !== address?.id) {
                    batch.update(docSnap.ref, { isDefault: false });
                }
            });
        }
        
        if (address) {
            // Update existing address
            const addressRef = doc(addressesCollection, address.id);
            batch.update(addressRef, addressData);
            toast({ title: 'Address Updated', description: 'Your address has been successfully updated.' });
        } else {
            // Add new address
            const newAddressRef = doc(addressesCollection);
            batch.set(newAddressRef, addressData);
            toast({ title: 'Address Added', description: 'Your new address has been saved.' });
        }
        
        await batch.commit();
        onOpenChange(false);

    } catch (error) {
        console.error("Error saving address: ", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'Could not save your address. Please try again.',
        });
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            Enter your shipping information below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Anytown" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input placeholder="CA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl><Input placeholder="12345" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input {...field} disabled /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Set as default</FormLabel>
                    <FormDescription>
                      Make this your primary shipping address.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleClose(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
