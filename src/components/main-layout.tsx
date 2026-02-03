
'use client';
import type { FC, ReactNode } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className={cn("flex-1", !isHomePage && 'pt-20')}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
