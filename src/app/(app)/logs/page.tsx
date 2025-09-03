'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DockerContainer } from '@/types';
import { getContainers, getContainerLogs } from '@/lib/actions';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function LogsPage() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getContainers().then(data => {
      const runningContainers = data.filter(c => c.State === 'running');
      setContainers(runningContainers);
      if (runningContainers.length > 0) {
        setSelectedContainer(runningContainers[0].Id);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedContainer) {
      setIsLoading(true);
      setLogs([]);
      getContainerLogs(selectedContainer).then(initialLogs => {
        setLogs(initialLogs);
        setIsLoading(false);
      });
    }
  }, [selectedContainer]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (selectedContainer && !isLoading) {
        const interval = setInterval(() => {
            setLogs(prev => [...prev, `[${new Date().toISOString()}] log entry for ${containers.find(c=>c.Id === selectedContainer)?.Names[0] || 'container'}`]);
        }, 3000);
        return () => clearInterval(interval);
    }
  }, [selectedContainer, isLoading, containers]);

  return (
    <div>
      <PageHeader title="Container Logs" description="View live log streams from your running containers." />
      <div className="mb-4">
        <Select onValueChange={setSelectedContainer} defaultValue={selectedContainer || undefined} disabled={containers.length === 0}>
            <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a container..." />
            </SelectTrigger>
            <SelectContent>
                {containers.map(c => (
                    <SelectItem key={c.Id} value={c.Id}>{c.Names[0].substring(1)} ({c.Image})</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Log output</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="bg-gray-900 dark:bg-black text-white font-mono text-xs rounded-md p-4 h-96 overflow-y-auto">
                {isLoading ? (
                    <Skeleton className="w-full h-full bg-gray-700"/>
                ) : logs.length > 0 ? (
                    logs.map((log, index) => (
                        <p key={index} className="whitespace-pre-wrap">{log}</p>
                    ))
                ) : (
                    <p className="text-gray-400">No logs to display for this container.</p>
                )}
                <div ref={logsEndRef} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
