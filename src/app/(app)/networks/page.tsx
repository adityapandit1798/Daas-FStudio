'use client';

import React, { useEffect, useState } from 'react';
import { DockerNetwork } from '@/types';
import { getNetworks } from '@/lib/actions';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function NetworksPage() {
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNetworks = () => {
    setIsLoading(true);
    getNetworks().then(data => {
      setNetworks(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const handleDelete = (networkName: string) => {
    toast({
        title: `Network Deleted`,
        description: `Successfully deleted network ${networkName}. (Mock action)`,
        variant: 'destructive'
    });
  };

  return (
    <div>
      <PageHeader title="Networks" description="Manage your Docker networks.">
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchNetworks} disabled={isLoading}><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</Button>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Network</Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : networks.length > 0 ? (
                networks.map(network => (
                  <TableRow key={network.Id}>
                    <TableCell className="font-medium">{network.Name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{network.Id}</TableCell>
                    <TableCell>{network.Driver}</TableCell>
                    <TableCell>{network.Scope}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={['host', 'bridge', 'none'].includes(network.Name)}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDelete(network.Name)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No networks found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
