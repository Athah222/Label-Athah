'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { CartSheet } from '@/components/cart-sheet';
import { cn } from '@/lib/utils';
import { SearchDialog } from './search-dialog';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const pathname = usePathname();
  
  const isHomePage = pathname === '/';

  useEffect(() => {
    const animationPlayed = sessionStorage.getItem('logoAnimationPlayed');
    if (animationPlayed) {
      setShowLogo(true);
    } else {
      const handleAnimationEnd = () => setShowLogo(true);
      window.addEventListener('logoAnimationEnd', handleAnimationEnd);
      return () => window.removeEventListener('logoAnimationEnd', handleAnimationEnd);
    }
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

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
  
  const headerClasses = cn(
      'fixed top-0 z-50 w-full transition-all duration-300',
       (scrolled || !isHomePage)
        ? 'border-b border-border/50 bg-background/80 backdrop-blur-lg'
        : 'bg-transparent',
       visible ? 'translate-y-0' : '-translate-y-full'
    );
  
  const navLinkClasses = cn(
      'text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary',
      (scrolled || !isHomePage) ? 'text-foreground' : 'text-white'
  );

  return (
    <>
    <header className={headerClasses}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className={cn("flex items-center gap-2 transition-opacity", showLogo ? "opacity-100" : "opacity-0")}>
          <Image 
            id="header-logo"
            src="/logo.png" 
            alt="Athah Logo" 
            width={180} 
            height={60} 
            className={cn("object-contain", (scrolled || !isHomePage) ? '' : 'invert brightness-0')}
            priority
          />
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          <Link href="/products" className={navLinkClasses}>All</Link>
          <Link href="/products/women" className={navLinkClasses}>Women's Wear</Link>
          <Link href="/products/men" className={navLinkClasses}>Men's Wear</Link>
        </nav>

        <div className={cn("flex items-center gap-2", (scrolled || !isHomePage) ? 'text-foreground' : 'text-white')}>
          <Button variant="ghost" size="icon" aria-label="Search" className="hover:bg-accent/50" onClick={() => setSearchOpen(true)}>
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
