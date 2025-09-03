'use client';

import { ConnectForm } from '@/components/ConnectForm';
import { useDocker } from '@/contexts/DockerContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ConnectPage() {
  const { connection, isLoading } = useDocker();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && connection) {
      router.replace('/dashboard');
    }
  }, [connection, isLoading, router]);

  if (isLoading || connection) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary font-headline">DockWatch</h1>
            <p className="text-muted-foreground mt-2">Connect to your Docker host to get started</p>
        </div>
        <ConnectForm />
      </div>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        <p>Built with ❤️ for Docker enthusiasts.</p>
      </footer>
    </main>
  );
}
