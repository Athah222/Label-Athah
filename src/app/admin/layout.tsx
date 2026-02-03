'use client';
import Link from "next/link";
import { Home, Package, ShoppingCart, Users, LogOut, ShieldAlert, Settings, ExternalLink, CircleUser } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import Image from 'next/image';
import type { User as UserProfile } from "@/lib/types";

function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <SidebarTrigger className="md:hidden"/>
        <div className="w-full flex-1">
            {/* Optional: Add a search bar here */}
        </div>
        <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">User menu</span>
        </Button>
        </header>
        <main className="flex-1 bg-muted/40 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user || userProfile?.role !== 'admin') {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground text-center max-w-md">
                You do not have the required administrator permissions to view this dashboard.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/">Back to Store</Link>
                </Button>
                {!user && (
                    <Button asChild>
                        <Link href="/login">Go to Login</Link>
                    </Button>
                )}
            </div>
        </div>
      );
  }

  return (
    <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[var(--sidebar-width)_1fr]">
            <Sidebar className="hidden border-r bg-muted/40 md:block">
                <SidebarContent>
                    <SidebarHeader className="h-14">
                        <Link href="/admin" className="flex items-center gap-2 font-semibold">
                            <Image 
                              src="/logo.png" 
                              alt="Athah Admin Logo"
                              width={100}
                              height={33}
                              className="object-contain"
                            />
                            <span className="font-sans text-xl text-primary/80">Admin</span>
                        </Link>
                    </SidebarHeader>
                    <SidebarMenu className="flex-1 mt-4">
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Dashboard" asChild>
                                <Link href="/admin"><Home />Dashboard</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Orders" asChild>
                                <Link href="/admin/orders">
                                    <ShoppingCart />
                                    <span>Orders</span>
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">6</Badge>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Products" asChild>
                                <Link href="/admin/products"><Package />Products</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Coupons" asChild>
                                <Link href="/admin/coupons"><Users />Coupons</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Settings" asChild>
                                <Link href="/admin/settings"><Settings />Settings</Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                     <SidebarFooter>
                        <SidebarSeparator />
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Visit Store" asChild>
                                    <Link href="/"><ExternalLink />Visit Store</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Logout" onClick={handleSignOut} className="hover:bg-destructive hover:text-destructive-foreground">
                                    <LogOut />Logout
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </SidebarContent>
            </Sidebar>
            <AdminDashboardLayout>
                {children}
            </AdminDashboardLayout>
        </div>
    </SidebarProvider>
  );
}
