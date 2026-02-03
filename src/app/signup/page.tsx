'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiateEmailSignUp, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/products');
    }
  }, [user, isUserLoading, router]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsLoading(true);

    initiateEmailSignUp(auth, email, password)
      .then((userCredential) => {
        if (userCredential.user) {
          const user = userCredential.user;
          const userDocRef = doc(firestore, 'users', user.uid);
          // Determine role based on name - for demo purposes.
          const isAdmin = fullName.toLowerCase().includes('admin');
          const userRole = isAdmin ? 'admin' : 'customer';

          // Update the user's profile display name
          updateProfile(user, {
            displayName: fullName,
          });

          // Create the user document in the 'users' collection.
          setDocumentNonBlocking(
            userDocRef,
            {
              email: user.email,
              displayName: fullName,
              role: userRole,
            },
            { merge: true }
          );

          // If the user is an admin, also create a document in the 'admins' collection
          if (isAdmin) {
            const adminDocRef = doc(firestore, 'admins', user.uid);
            setDocumentNonBlocking(adminDocRef, {
                createdAt: new Date().toISOString(),
            }, {});
          }
        }
      })
      .catch((error) => {
        let title = "Signup Failed";
        let description = "An unexpected error occurred. Please try again.";

        switch(error.code) {
            case 'auth/email-already-in-use':
                title = "Email Already Registered";
                description = "An account with this email address already exists. Please log in.";
                break;
            case 'auth/weak-password':
                title = "Weak Password";
                description = "Your password should be at least 6 characters long.";
                break;
            case 'auth/invalid-email':
                title = "Invalid Email";
                description = "Please enter a valid email address.";
                break;
        }

        toast({
            variant: "destructive",
            title: title,
            description: description,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50">
      <Card className="relative mx-auto w-full max-w-sm">
        <Link href="/" className="absolute left-4 top-4 flex items-center gap-1 font-light text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
        </Link>
        <CardHeader>
          <Link href="/" className="mb-4 pt-8 flex justify-center">
             <Image 
              src="/Athah logo (off white) with golden pallet final.png" 
              alt="Athah Logo" 
              width={150} 
              height={50} 
              className="object-contain"
              priority
            />
          </Link>
          <CardDescription className="text-center">
            Create an account to start shopping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full name</Label>
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create an account
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
