
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from 'firebase/auth';

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
import { useToast } from '@/hooks/use-toast';

interface CustomSizeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  user: User | null;
}

const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  message: z.string().min(10, 'Please provide your measurements or details.'),
});

export function CustomSizeDialog({
  isOpen,
  onOpenChange,
  productName,
  user,
}: CustomSizeDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      message: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.displayName || '',
        email: user.email || '',
        message: '',
      });
    }
  }, [user, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = {
      ...values,
      _subject: `Custom Size Request for: ${productName}`,
      product: productName,
    };

    try {
      const response = await fetch('https://formspree.io/f/mpwkajod', { // IMPORTANT: Replace with your Formspree form ID
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
            title: 'Request Sent!',
            description: "We've received your custom size request. We will get back to you shortly.",
        });
        onOpenChange(false);
      } else {
        toast({
            title: 'Submission Failed',
            description: "There was a problem sending your request. Please try again.",
            variant: 'destructive',
        });
      }
    } catch (error) {
       toast({
            title: 'Error',
            description: "An unexpected error occurred. Please check your connection and try again.",
            variant: 'destructive',
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Custom Size</DialogTitle>
          <DialogDescription>
            Need a size that's not listed? Fill out the form below, and we'll
            get in touch to discuss a custom-made piece just for you.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" name="_subject" value={`Custom Size Request for ${productName}`} />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Measurements & Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide your measurements (e.g., chest, waist, hips in inches or cm) and any other specific requests."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    We'll use this to start the conversation about your custom piece.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>Send Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
