import { ReactNode } from 'react';
import { Academic3DBackground } from '@/components/background/Academic3DBackground';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface PageLayoutProps {
  children: ReactNode;
  intensity3D?: 'subtle' | 'medium' | 'prominent';
  show3D?: boolean;
}

export function PageLayout({ children, intensity3D = 'subtle', show3D = true }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen">
      {/* 3D Background Layer */}
      {show3D && <Academic3DBackground intensity={intensity3D} />}
      
      {/* Content Layer with proper z-indexing */}
      <div className="relative z-10">
        <Navbar />
        <main className="relative">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
