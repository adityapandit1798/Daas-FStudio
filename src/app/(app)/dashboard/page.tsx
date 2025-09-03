'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getDashboardStats } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';
import { BarChart, Cpu, Server, Ship, Network, Database, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Stats = Awaited<ReturnType<typeof getDashboardStats>> | { error: string };

const chartConfig = {
  usage: {
    label: "Usage",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  console.log('DashboardPage: component rendered');

  useEffect(() => {
    console.log('DashboardPage: useEffect triggered');
    getDashboardStats().then(data => {
        console.log('DashboardPage: stats received', data);
        setStats(data);
    });
  }, []);

  const isLoading = !stats;
  const isError = stats && 'error' in stats && stats.error;
  
  const chartData = stats && !isError ? [
      { resource: 'CPU', usage: stats.cpuUsage },
      { resource: 'Memory', usage: stats.memoryUsage },
    ] : [];

  const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );

  if (isError) {
    console.error('DashboardPage: rendering error state', stats.error);
    return (
        <div>
            <PageHeader title="Dashboard" description="Overview of your Docker environment." />
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                    <p>Could not connect to the Docker host. Please check your connection details and try again.</p>
                    <p className="font-mono text-xs mt-2 bg-destructive/20 p-2 rounded-md">{stats.error}</p>
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  console.log('DashboardPage: rendering dashboard content');
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your Docker environment." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Containers" value={stats?.totalContainers ?? 0} icon={Ship} isLoading={isLoading} />
        <StatCard title="Running" value={stats?.runningContainers ?? 0} icon={Ship} isLoading={isLoading} />
        <StatCard title="Stopped" value={stats?.stoppedContainers ?? 0} icon={Ship} isLoading={isLoading} />
        <StatCard title="Total Images" value={stats?.totalImages ?? 0} icon={Server} isLoading={isLoading} />
        <StatCard title="Total Networks" value={stats?.totalNetworks ?? 0} icon={Network} isLoading={isLoading} />
        <StatCard title="Total Volumes" value={stats?.totalVolumes ?? 0} icon={Database} isLoading={isLoading} />
      </div>
      <div className="grid gap-4 mt-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5"/> Resource Usage</CardTitle>
            </CardHeader>
            <CardContent>
                {stats ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <RechartsBarChart data={chartData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="resource" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis unit="%" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="usage" fill="var(--color-usage)" radius={4} />
                        </RechartsBarChart>
                    </ChartContainer>
                ) : (
                    <Skeleton className="h-[250px] w-full" />
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5"/> Host Info</CardTitle>
            </Header>
            <CardContent className="space-y-4">
                 {stats ? (
                    <>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span>Docker Version:</span> <span className="font-mono">{stats.Swarm?.DockerRootDir ? 'Unknown' : 'N/A'}</span></div>
                            <div className="flex justify-between"><span>Operating System:</span> <span className="font-mono">{stats.OperatingSystem}</span></div>
                            <div className="flex justify-between"><span>Architecture:</span> <span className="font-mono">{stats.Architecture}</span></div>
                            <div className="flex justify-between"><span>CPUs:</span> <span className="font-mono">{stats.NCPU}</span></div>
                            <div className="flex justify-between"><span>Total Memory:</span> <span className="font-mono">{stats.memoryLimit.toFixed(2)} GB</span></div>
                        </div>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>CPU Usage</CardDescription>
                                <CardTitle className="text-4xl">{stats.cpuUsage.toFixed(2)}%</CardTitle>
                            </Header>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                Based on running containers vs available CPUs
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Memory Usage</CardDescription>
                                <CardTitle className="text-4xl">{stats.memoryUsage.toFixed(2)}%</CardTitle>
                            </Header>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                {((stats.memoryLimit * (stats.memoryUsage / 100))).toFixed(2)} GB of {stats.memoryLimit.toFixed(2)} GB used
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
