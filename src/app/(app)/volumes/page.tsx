'use client';

import React, { useEffect, useState } from 'react';
import { DockerVolume } from '@/types';
import { getVolumes } from '@/lib/actions';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function VolumesPage() {
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVolumes = () => {
    setIsLoading(true);
    getVolumes().then(data => {
      setVolumes(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchVolumes();
  }, []);

  const handleDelete = (volumeName: string) => {
    toast({
        title: `Volume Deleted`,
        description: `Successfully deleted volume ${volumeName}. (Mock action)`,
        variant: 'destructive'
    });
  };

  return (
    <div>
      <PageHeader title="Volumes" description="Manage your Docker volumes for persistent storage.">
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchVolumes} disabled={isLoading}><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</Button>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Volume</Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Mountpoint</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : volumes.length > 0 ? (
                volumes.map(volume => (
                  <TableRow key={volume.Name}>
                    <TableCell className="font-medium">{volume.Name}</TableCell>
                    <TableCell>{volume.Driver}</TableCell>
                    <TableCell className="font-mono text-muted-foreground text-xs">{volume.Mountpoint}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDelete(volume.Name)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">No volumes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
