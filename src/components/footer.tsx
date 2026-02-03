import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';


// SVG for Pinterest Icon
const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.31 15.25c-1.12 0-2.22-.39-3.03-1.14-.8-.75-1.2-1.8-1.2-2.92 0-1.74.87-3.23 2.18-4.04.53-.33.72-.99.46-1.52-.25-.53-.87-.73-1.4-.48-1.7.83-2.78 2.5-2.78 4.47 0 1.63.7 3.1 1.85 4.14 1.15 1.04 2.67 1.6 4.3 1.6 2.8 0 4.96-1.93 4.96-4.81 0-2.31-1.35-3.69-3.05-3.69-1.1 0-1.86.83-1.86 1.83 0 .7.26 1.17.65 1.5.39.33.43.59.16.99-.34.5-.83.6-1.34.46-1.2-.35-1.95-1.48-1.95-2.72 0-1.9 1.48-3.53 3.61-3.53 2.65 0 4.54 2.02 4.54 4.92 0 3.32-2.02 5.56-5.11 5.56z" />
    </svg>
);


export default function Footer() {
  return (
    <footer className="bg-secondary/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Athah Logo" 
                width={120} 
                height={40} 
                className="object-contain"
              />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">Timeless Elegance, Redefined.</p>
             <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><PinterestIcon className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-4">
            <div>
              <h3 className="font-semibold tracking-wider text-foreground">Shop</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary">All Collections</Link></li>
                <li><Link href="/products/women" className="text-sm text-muted-foreground hover:text-primary">Women's Wear</Link></li>
                <li><Link href="/products/men" className="text-sm text-muted-foreground hover:text-primary">Men's Wear</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider text-foreground">About</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">Our Story</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider text-foreground">Help</h3>
              <ul className="mt-4 space-y-2">
                 <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
                <li><Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
                <h3 className="font-semibold tracking-wider text-foreground">Newsletter</h3>
                <p className="mt-4 text-sm text-muted-foreground">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Athah. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
