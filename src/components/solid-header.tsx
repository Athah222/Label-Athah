
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { CartSheet } from '@/components/cart-sheet';
import { cn } from '@/lib/utils';
import { SearchDialog } from './search-dialog';
import Image from 'next/image';

export function SolidHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Check if the animation has played by checking sessionStorage
    const animationPlayed = sessionStorage.getItem('logoAnimationPlayed');
    if (animationPlayed) {
      setShowLogo(true);
    } else {
      // Listen for a custom event that the animation component will dispatch
      const handleAnimationEnd = () => setShowLogo(true);
      window.addEventListener('logoAnimationEnd', handleAnimationEnd);
      return () => window.removeEventListener('logoAnimationEnd', handleAnimationEnd);
    }
  }, []);

   useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navLinks = [
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-secondary/30'
        )}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex w-1/3 justify-start">
             <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link
                  href="/products"
                  className="font-body text-primary transition-colors hover:text-primary/80"
                >
                  Shop
                </Link>
                <Link
                  href="/about"
                  className="font-body text-primary transition-colors hover:text-primary/80"
                >
                  About
                </Link>
              </nav>
          </div>

          <div className="flex w-1/3 justify-center">
            <Link href="/" className={cn("flex items-center gap-2 transition-opacity", showLogo ? "opacity-100" : "opacity-0")}>
               <Image 
                id="header-logo"
                src="/logo.png" 
                alt="Athah Logo" 
                width={180} 
                height={60} 
                className="object-contain"
                priority
               />
            </Link>
          </div>

          <div className="flex w-1/3 items-center justify-end gap-1">
              <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            <UserNav />
            <CartSheet />
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
