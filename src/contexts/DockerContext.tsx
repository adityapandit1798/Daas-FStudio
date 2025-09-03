'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface DockerConnection {
  host: string;
  protocol: 'http' | 'https';
  ca?: string;
  cert?: string;
  key?: string;
}

interface DockerContextType {
  connection: DockerConnection | null;
  setConnection: (connection: DockerConnection | null) => void;
  isLoading: boolean;
}

const DockerContext = createContext<DockerContextType | undefined>(undefined);

export function DockerProvider({ children }: { children: ReactNode }) {
  const [connection, setConnectionState] = useState<DockerConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedConnection = localStorage.getItem('dockerConnection');
      if (storedConnection) {
        setConnectionState(JSON.parse(storedConnection));
      } else if (pathname !== '/') {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to parse docker connection from localStorage', error);
      if (pathname !== '/') {
        router.push('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  const setConnection = (conn: DockerConnection | null) => {
    setConnectionState(conn);
    if (conn) {
      localStorage.setItem('dockerConnection', JSON.stringify(conn));
    } else {
      localStorage.removeItem('dockerConnection');
    }
  };

  const value = { connection, setConnection, isLoading };

  return (
    <DockerContext.Provider value={value}>
      {children}
    </DockerContext.Provider>
  );
}

export function useDocker() {
  const context = useContext(DockerContext);
  if (context === undefined) {
    throw new Error('useDocker must be used within a DockerProvider');
  }
  return context;
}
