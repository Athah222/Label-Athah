'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/types';
import { useFirestore, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import slugify from 'slugify';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  price: z.coerce.number().min(0, {
    message: 'Price must be a positive number.',
  }),
  stock: z.coerce.number().int().min(0, {
    message: 'Stock must be a non-negative integer.',
  }),
  category: z.string().min(2, {
    message: 'Category must be at least 2 characters.',
  }),
  imageUrls: z.string().min(1, 'Please enter at least one image URL.'),
  availableSizes: z.array(z.string()).min(1, 'Please select at least one size.'),
});

const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const categories = ["Kurtas", "Casual Shirts", "Vest Coats", "One Piece"];

export function ProductDialog({ isOpen, onOpenChange, product }: ProductDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      imageUrls: '',
      availableSizes: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (product) {
          form.reset({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category,
            imageUrls: product.images?.map(img => img.imageUrl).join(', ') || '',
            availableSizes: product.availableSizes || [],
          });
        } else {
          form.reset({
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category: '',
            imageUrls: 'https://picsum.photos/seed/placeholder/800/1200',
            availableSizes: ['S', 'M', 'L'],
          });
        }
    }
  }, [product, form, isOpen]);

  function convertGoogleDriveLink(url: string) {
    const driveIdMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    if (url.includes('drive.google.com') && driveIdMatch) {
      return `https://drive.google.com/uc?id=${driveIdMatch[1]}`;
    }
    return url;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    const urls = values.imageUrls.split(',').map(url => url.trim()).filter(url => url !== '');
    const images = urls.map((url, index) => {
        const directUrl = convertGoogleDriveLink(url);
        return {
            id: String(index + 1),
            imageUrl: directUrl,
            description: `Image ${index + 1} of ${values.name}`,
            imageHint: 'product image'
        };
    });

    const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        stock: values.stock,
        category: values.category,
        slug: slugify(values.name, { lower: true, strict: true }),
        images: images,
        availableSizes: values.availableSizes,
    };

    if (product) {
        const productRef = doc(firestore, 'products', product.id);
        setDocumentNonBlocking(productRef, productData, { merge: true });
        toast({ title: 'Product Updated', description: `${values.name} has been updated.` });
    } else {
        const productsCollection = collection(firestore, 'products');
        addDocumentNonBlocking(productsCollection, productData);
        toast({ title: 'Product Added', description: `${values.name} has been added to your store.` });
    }

    onOpenChange(false);
  }
  
  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Make changes to your product here.' : 'Fill out the details for your new product.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Golden Saree" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the product..." {...field} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (INR)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="499.99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availableSizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Sizes</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="justify-start flex-wrap"
                        >
                          {allSizes.map(size => (
                            <ToggleGroupItem key={size} value={size}>
                              {size}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URLs (Comma separated)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="https://drive.google.com/..., https://picsum.photos/..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter multiple URLs separated by commas. Google Drive links will be automatically converted.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t mt-4">
              <Button type="button" variant="ghost" onClick={() => handleClose(false)}>Cancel</Button>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
