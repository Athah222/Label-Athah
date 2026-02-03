import type { FC, ReactNode } from 'react';
import { SolidHeader } from '@/components/solid-header';
import Footer from '@/components/footer';

interface HomeLayoutProps {
  children: ReactNode;
}

export const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SolidHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
