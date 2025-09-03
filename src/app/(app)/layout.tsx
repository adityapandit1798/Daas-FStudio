'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useDocker } from '@/contexts/DockerContext';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { connection, isLoading } = useDocker();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !connection) {
      router.replace('/');
    }
  }, [connection, isLoading, router]);

  if (isLoading || !connection) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
