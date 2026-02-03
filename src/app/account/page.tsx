
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, ShoppingBag, MapPin, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

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
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    const names = name.split(' ');
    if(names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 border-4 border-gold">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
              <AvatarFallback className="text-4xl">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-headline text-4xl">{user.displayName || 'Valued Customer'}</h1>
            <p className="text-lg text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">My Profile</CardTitle>
              <User className="h-6 w-6 text-gold" />
            </CardHeader>
            <CardContent>
              <CardDescription>View and edit your personal details.</CardDescription>
            </CardContent>
            <CardContent>
                <Button asChild variant="outline">
                    <Link href="/account/profile">Go to Profile <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">My Orders</CardTitle>
              <ShoppingBag className="h-6 w-6 text-gold" />
            </CardHeader>
            <CardContent>
              <CardDescription>Track your past and current orders.</CardDescription>
            </CardContent>
             <CardContent>
                <Button asChild variant="outline">
                    <Link href="/account/orders">View Orders <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">My Addresses</CardTitle>
              <MapPin className="h-6 w-6 text-gold" />
            </CardHeader>
            <CardContent>
              <CardDescription>Manage your shipping addresses.</CardDescription>
            </CardContent>
             <CardContent>
                <Button asChild variant="outline">
                    <Link href="/account/addresses">Manage Addresses <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Account Settings</CardTitle>
              <Settings className="h-6 w-6 text-gold" />
            </CardHeader>
            <CardContent>
              <CardDescription>Change your password and preferences.</CardDescription>
            </CardContent>
             <CardContent>
                <Button asChild variant="outline">
                    <Link href="/account/settings">Go to Settings <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
