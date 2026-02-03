
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useUser } from '@/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Moon, Sun, CaseSensitive } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


export default function SettingsPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationPassword, setDeleteConfirmationPassword] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
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

  const handlePasswordChange = async (values: z.infer<typeof passwordFormSchema>) => {
    if (!user || !user.email || !auth) {
        toast({
            title: "Error",
            description: "You must be logged in to change your password.",
            variant: "destructive"
        });
        return;
    }

    setIsSubmittingPassword(true);

    try {
        const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, values.newPassword);
        toast({
            title: "Success",
            description: "Your password has been updated successfully.",
        });
        passwordForm.reset();
    } catch (error: any) {
        console.error("Password change error:", error);
        let description = "An unknown error occurred.";
        if (error.code === 'auth/wrong-password') {
            description = "The current password you entered is incorrect. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
            description = "You've made too many attempts. Please try again later.";
        }
        toast({
            title: "Password Change Failed",
            description,
            variant: "destructive"
        });
    } finally {
        setIsSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) {
        toast({ title: "Error", description: "User not found.", variant: "destructive" });
        return;
    }
    if (!deleteConfirmationPassword) {
        toast({ title: "Password Required", description: "Please enter your password to confirm.", variant: "destructive" });
        return;
    }

    setIsDeleting(true);
    try {
        const credential = EmailAuthProvider.credential(user.email, deleteConfirmationPassword);
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user);
        toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
        // The user will be redirected automatically by the auth listener.
        setIsAlertOpen(false);
    } catch (error: any) {
        console.error("Account deletion error:", error);
         let description = "An unknown error occurred during account deletion.";
        if (error.code === 'auth/wrong-password') {
            description = "The password you entered is incorrect. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
            description = "You've made too many attempts to re-authenticate. Please try again later.";
        }
        toast({ title: "Deletion Failed", description, variant: "destructive" });
    } finally {
        setIsDeleting(false);
        setDeleteConfirmationPassword('');
    }
  }


  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-headline text-4xl mb-8">Account Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password here. For security, you will need to provide your current password.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-6">
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmittingPassword}>
                            {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
            </Card>

            <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="theme-switch">Theme</Label>
                        <p className="text-sm text-muted-foreground">
                            Switch between light and dark mode.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        <Switch
                            id="theme-switch"
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            aria-label="Toggle theme"
                        />
                        <Moon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
            </Card>

            <Card className="border-destructive md:col-span-2">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>This action is irreversible. Please proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                </div>
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers. To confirm, please enter your password below.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid gap-2 py-2">
                            <Label htmlFor="delete-confirm-password">Password</Label>
                            <Input
                                id="delete-confirm-password"
                                type="password"
                                value={deleteConfirmationPassword}
                                onChange={(e) => setDeleteConfirmationPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete My Account
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
