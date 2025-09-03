'use client';

import React, { useEffect, useState } from 'react';
import { DockerContainer } from '@/types';
import { getContainers } from '@/lib/actions';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Play, StopCircle, Trash2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ContainersPage() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchContainers = () => {
    setIsLoading(true);
    getContainers().then(data => {
      setContainers(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchContainers();
  }, []);
  
  const handleAction = (action: string, containerName: string) => {
    toast({
        title: `Action: ${action}`,
        description: `Triggered ${action} for container ${containerName}. (Mock action)`,
    });
  }

  const StateBadge = ({ state }: { state: DockerContainer['State'] }) => {
    const variants = {
      running: 'default',
      exited: 'secondary',
      created: 'outline',
      restarting: 'destructive',
      paused: 'destructive',
    } as const;
    const colors = {
        running: 'bg-green-500 hover:bg-green-500/80',
        exited: 'bg-gray-500 hover:bg-gray-500/80',
        created: 'bg-blue-500 hover:bg-blue-500/80',
        restarting: 'bg-yellow-500 hover:bg-yellow-500/80',
        paused: 'bg-orange-500 hover:bg-orange-500/80',
    }
    return <Badge variant={variants[state]} className={colors[state]}>{state}</Badge>;
  };

  return (
    <div>
      <PageHeader title="Containers" description="Manage your Docker containers.">
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchContainers} disabled={isLoading}><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</Button>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Container</Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : containers.length > 0 ? (
                containers.map(container => (
                  <TableRow key={container.Id}>
                    <TableCell className="font-medium">{container.Names[0].substring(1)}</TableCell>
                    <TableCell><StateBadge state={container.State} /></TableCell>
                    <TableCell>{container.Image}</TableCell>
                    <TableCell className="text-muted-foreground">{container.Status}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction('Start', container.Names[0])} disabled={container.State === 'running'}>
                                <Play className="mr-2 h-4 w-4"/> Start
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Stop', container.Names[0])} disabled={container.State !== 'running'}>
                                <StopCircle className="mr-2 h-4 w-4"/> Stop
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Delete', container.Names[0])} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No containers found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
