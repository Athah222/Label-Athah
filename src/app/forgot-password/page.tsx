'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiatePasswordReset } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth || !email) return;

    setIsLoading(true);
    try {
      // We pass the email to Firebase to trigger the standard reset flow
      await initiatePasswordReset(auth, email);
      setIsSubmitted(true);
      toast({
        title: "Reset Email Sent",
        description: `If an account exists for ${email}, you will receive a reset link shortly.`,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      let title = "Request Failed";
      let description = "Could not send reset email. Please check the email address and try again.";

      // Common Firebase Auth error codes
      if (error.code === 'auth/user-not-found') {
        description = "No account found with this email address.";
      } else if (error.code === 'auth/invalid-email') {
        description = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        description = "Too many requests. Please try again later.";
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-4">
      <Card className="relative mx-auto w-full max-w-md shadow-xl border-none">
        <Link 
          href="/login" 
          className="absolute left-6 top-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
        
        <CardHeader className="pt-16 pb-8">
          <div className="mb-6 flex justify-center">
            <Image 
              src="/logo.png" 
              alt="Athah Logo" 
              width={180} 
              height={60} 
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-3xl font-headline text-center">Reset Password</CardTitle>
          <CardDescription className="text-center text-base mt-2">
            {isSubmitted 
              ? "We've sent recovery instructions to your email."
              : "Enter your email address and we'll send you a secure link to reset your account password."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          {!isSubmitted ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="h-12 border-muted bg-background/50 focus:bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all shadow-md" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in duration-300">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground leading-relaxed">
                  We've sent a password reset link to <br/><strong className="text-foreground">{email}</strong>.
                </p>
                <p className="text-sm text-muted-foreground/80 italic">
                  Don't see it? Please check your spam folder.
                </p>
              </div>
              <div className="w-full space-y-3">
                <Button variant="outline" className="w-full h-11" onClick={() => setIsSubmitted(false)}>
                  Try another email
                </Button>
                <Button variant="ghost" className="w-full h-11" onClick={() => handleReset()} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Resend Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
