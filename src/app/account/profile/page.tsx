
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDesc, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
});

export default function ProfilePage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
        displayName: user?.displayName || '',
        email: user?.email || '',
    }
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);
  
  if (isUserLoading || !user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user || !firestore || !auth) return;

    setIsSubmitting(true);
    const { displayName, email } = values;
    const promises = [];
    const userDocRef = doc(firestore, 'users', user.uid);
    let nameUpdated = false;

    // 1. Update Display Name if it has changed
    if (displayName !== user.displayName) {
        promises.push(updateProfile(user, { displayName }));
        promises.push(setDocumentNonBlocking(userDocRef, { displayName }, { merge: true }));
        nameUpdated = true;
    }

    // 2. Handle Email Change
    if (email !== user.email) {
      setNewEmail(email);
      setIsAlertOpen(true);
      setIsSubmitting(false); // Stop here and let the dialog handle the rest
      return; 
    }
    
    if(!nameUpdated) {
        toast({ title: 'No Changes', description: 'Your profile information is already up to date.' });
        setIsSubmitting(false);
        return;
    }

    try {
        await Promise.all(promises);
        toast({ title: 'Profile Updated', description: 'Your display name has been successfully updated.' });
    } catch (error) {
        console.error("Profile update error:", error);
        toast({ title: "Update Failed", description: "Could not update your profile. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEmailChangeConfirm = async () => {
    if (!user || !user.email || !auth || !firestore || !password || !newEmail) return;

    setIsSubmitting(true);
    setIsAlertOpen(false);

    try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        
        await verifyBeforeUpdateEmail(user, newEmail);

        // Also update firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, { email: newEmail }, { merge: true });

        toast({
            title: 'Verification Email Sent',
            description: `A verification link has been sent to ${newEmail}. Please check your inbox to complete the email change.`,
        });
        
        form.reset({
            displayName: user.displayName || '',
            email: newEmail,
        });

    } catch (error: any) {
        console.error("Email change error:", error);
        let description = "An unknown error occurred.";
        if (error.code === 'auth/wrong-password') {
            description = "The password you entered is incorrect.";
        } else if (error.code === 'auth/email-already-in-use') {
            description = "This email address is already in use by another account.";
        }
        toast({ title: "Email Change Failed", description, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        setPassword('');
        setNewEmail('');
    }
  }


  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-headline text-4xl mb-8">My Profile</h1>
        <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        A verification link will be sent to your new email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </div>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Confirm Your Identity</AlertDialogTitle>
              <AlertDialogDesc>
                  To change your email address, please enter your current password.
              </AlertDialogDesc>
              </AlertDialogHeader>
              <div className="grid gap-2 py-2">
                  <Label htmlFor="email-change-password">Password</Label>
                  <Input
                      id="email-change-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                  />
              </div>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPassword('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEmailChangeConfirm} disabled={isSubmitting || !password}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm
              </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
