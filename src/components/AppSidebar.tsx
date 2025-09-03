'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Box,
  Server,
  Network,
  Database,
  Search,
  BookOpen,
  Terminal,
  ShipWheel,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useDocker } from '@/contexts/DockerContext';
import { useRouter } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/containers', label: 'Containers', icon: Box },
  { href: '/images', label: 'Images', icon: Server },
  { href: '/images/search', label: 'Search Images', icon: Search },
  { href: '/networks', label: 'Networks', icon: Network },
  { href: '/volumes', label: 'Volumes', icon: Database },
  { href: '/logs', label: 'Logs', icon: BookOpen },
  { href: '/console', label: 'Console', icon: Terminal },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setConnection, connection } = useDocker();
  const router = useRouter();

  const handleDisconnect = () => {
    setConnection(null);
    router.push('/');
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <ShipWheel className="h-8 w-8 text-accent"/>
            <h1 className="text-xl font-bold text-sidebar-foreground font-headline group-data-[collapsible=icon]:hidden">DockWatch</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/images' || pathname === '/images')}
                tooltip={{ children: item.label, side: 'right' }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="text-xs text-sidebar-foreground/70 px-4 group-data-[collapsible=icon]:hidden">
            <p className="font-semibold">Connected to:</p>
            <p className="truncate">{connection?.host}</p>
        </div>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleDisconnect} tooltip={{ children: 'Disconnect', side: 'right' }}>
                    <LogOut />
                    <span>Disconnect</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
