'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  if (isLoginPage || isLandingPage) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-16 transition-all duration-300 pb-16 md:pb-0">
        {/* Topbar */}
        <Topbar />

        {/* Scrollable Viewport */}
        <main className="flex-1 p-4 md:p-6 mt-14 overflow-y-auto overflow-x-hidden relative scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
