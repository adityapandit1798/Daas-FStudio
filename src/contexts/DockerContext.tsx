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

// Helper to set a cookie
const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

// Helper to get a cookie
const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

// Helper to erase a cookie
const eraseCookie = (name: string) => {   
    document.cookie = name+'=; Max-Age=-99999999; path=/;';  
}

export function DockerProvider({ children }: { children: ReactNode }) {
  const [connection, setConnectionState] = useState<DockerConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedConnection = getCookie('dockerConnection');
      if (storedConnection) {
        setConnectionState(JSON.parse(storedConnection));
      } else if (pathname !== '/') {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to parse docker connection from cookie', error);
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
      setCookie('dockerConnection', JSON.stringify(conn), 7);
    } else {
      eraseCookie('dockerConnection');
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
