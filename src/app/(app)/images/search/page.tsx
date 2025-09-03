'use client';

import React, { useState, useTransition } from 'react';
import { DockerHubImage } from '@/types';
import { searchDockerHub } from '@/lib/actions';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Star, ChevronsRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImageSearchPage() {
  const [searchTerm, setSearchTerm] = useState('nginx');
  const [imageResult, setImageResult] = useState<DockerHubImage | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, startSearchTransition] = useTransition();
  const [isPulling, setIsPulling] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchTerm) return;
    setNotFound(false);
    setImageResult(null);
    startSearchTransition(async () => {
      const result = await searchDockerHub(searchTerm);
      if (result) {
        setImageResult(result);
      } else {
        setNotFound(true);
      }
    });
  };

  const handlePull = () => {
    setIsPulling(true);
    toast({
        title: "Pulling Image...",
        description: `Request to pull ${imageResult?.name}:latest has been sent.`,
    });
    setTimeout(() => {
        setIsPulling(false);
        toast({
            title: "Pull Successful",
            description: `Image ${imageResult?.name}:latest has been pulled. (Mock action)`,
        });
    }, 2000)
  }

  return (
    <div>
      <PageHeader title="Search Images" description="Find and pull images from Docker Hub." />
      <div className="flex gap-2 mb-6">
        <Input 
            placeholder="e.g., redis, node, postgres..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="max-w-sm"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />} Search
        </Button>
      </div>

      {isSearching && <Skeleton className="w-full h-96" />}

      {!isSearching && imageResult && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>library/{imageResult.name}</span>
                    <div className="flex items-center gap-4 text-sm font-normal">
                         <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400"/> {imageResult.star_count.toLocaleString()}</span>
                         <span className="flex items-center gap-1"><Download className="h-4 w-4"/> {imageResult.pull_count.toLocaleString()}</span>
                    </div>
                </CardTitle>
                <CardDescription>
                    Last updated {formatDistanceToNow(new Date(imageResult.last_updated), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div 
                    className="prose prose-sm dark:prose-invert max-w-none max-h-96 overflow-y-auto rounded-md border p-4"
                    dangerouslySetInnerHTML={{ __html: imageResult.renderedDescription }}
                />
            </CardContent>
            <CardFooter>
                 <Button onClick={handlePull} disabled={isPulling}>
                    {isPulling ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ChevronsRight className="mr-2 h-4 w-4" />} 
                    Pull latest
                </Button>
            </CardFooter>
        </Card>
      )}

      {!isSearching && notFound && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardHeader>
                <CardTitle>Image Not Found</CardTitle>
                <CardDescription>
                    The image `library/{searchTerm}` could not be found on Docker Hub.
                    <br />
                    Please check the name and try again.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

    </div>
  );
}
