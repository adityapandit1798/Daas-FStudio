'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';
import { BarChart, Cpu, Server, Ship, Network, Database } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid } from "recharts"

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

const chartConfig = {
  usage: {
    label: "Usage",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const chartData = stats ? [
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
  )

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your Docker environment." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Containers" value={stats?.totalContainers ?? 0} icon={Ship} isLoading={!stats} />
        <StatCard title="Running" value={stats?.runningContainers ?? 0} icon={Ship} isLoading={!stats} />
        <StatCard title="Stopped" value={stats?.stoppedContainers ?? 0} icon={Ship} isLoading={!stats} />
        <StatCard title="Total Images" value={stats?.totalImages ?? 0} icon={Server} isLoading={!stats} />
        <StatCard title="Total Networks" value={stats?.totalNetworks ?? 0} icon={Network} isLoading={!stats} />
        <Stat_Card title="Total Volumes" value={stats?.totalVolumes ?? 0} icon={Database} isLoading={!stats} />
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
            </CardHeader>
            <CardContent className="space-y-4">
                 {stats ? (
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between"><span>CPU Usage:</span> <span className="font-mono">{stats.cpuUsage.toFixed(2)}%</span></div>
                        <div className="flex justify-between"><span>Memory Usage:</span> <span className="font-mono">{(stats.memoryUsage / 100 * stats.memoryLimit).toFixed(2)} GB / {stats.memoryLimit} GB</span></div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
