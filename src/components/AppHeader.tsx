'use client';

import { SidebarTrigger } from './ui/sidebar';
import { useDocker } from '@/contexts/DockerContext';

export function AppHeader() {
    const { connection } = useDocker();
    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
            <div className='flex-1'>
                <SidebarTrigger className="md:hidden" />
            </div>
            <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <span>Connected to:</span>
                <span className="font-semibold text-foreground">{connection?.host}</span>
            </div>
        </header>
    )
}
