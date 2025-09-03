'use client';
import { DockerContainer, DockerImage, DockerNetwork, DockerVolume, DockerHubImage } from '@/types';
import { renderMarkdownDescription } from '@/ai/flows/image-search-markdown-rendering';

// Mock Data
const MOCK_CONTAINERS: DockerContainer[] = [
  { Id: 'a1b2c3d4e5f6', Names: ['/web-server-prod'], Image: 'nginx:latest', State: 'running', Status: 'Up 2 hours', Ports: [{ PrivatePort: 80, PublicPort: 8080, Type: 'tcp' }] },
  { Id: 'b2c3d4e5f6a1', Names: ['/db-mongo'], Image: 'mongo:4.4', State: 'running', Status: 'Up 3 days', Ports: [{ PrivatePort: 27017, PublicPort: 27017, Type: 'tcp' }] },
  { Id: 'c3d4e5f6a1b2', Names: ['/old-web-server'], Image: 'nginx:1.20', State: 'exited', Status: 'Exited (0) 2 weeks ago', Ports: [] },
  { Id: 'd4e5f6a1b2c3', Names: ['/redis-cache'], Image: 'redis:alpine', State: 'running', Status: 'Up 1 day', Ports: [{ PrivatePort: 6379, PublicPort: 6379, Type: 'tcp' }] },
  { Id: 'e5f6a1b2c3d4', Names: ['/data-processor'], Image: 'ubuntu:latest', State: 'created', Status: 'Created', Ports: [] },
];

const MOCK_IMAGES: DockerImage[] = [
  { Id: 'sha256:f6f397579981', RepoTags: ['nginx:latest', 'nginx:1.21'], Created: 1678886400, Size: 133000000 },
  { Id: 'sha256:a2a4b6b7c8d9', RepoTags: ['mongo:4.4'], Created: 1678880000, Size: 450000000 },
  { Id: 'sha256:b3b4c5c6d7e8', RepoTags: ['redis:alpine'], Created: 1678870000, Size: 32000000 },
  { Id: 'sha256:c4c5d6d7e8f9', RepoTags: ['ubuntu:latest'], Created: 1678860000, Size: 72900000 },
];

const MOCK_NETWORKS: DockerNetwork[] = [
    { Id: 'net1', Name: 'bridge', Driver: 'bridge', Scope: 'local' },
    { Id: 'net2', Name: 'host', Driver: 'host', Scope: 'local' },
    { Id: 'net3', Name: 'none', Driver: 'none', Scope: 'local' },
    { Id: 'net4', Name: 'my-app-net', Driver: 'bridge', Scope: 'local' },
];

const MOCK_VOLUMES: DockerVolume[] = [
    { Name: 'mongo-data', Driver: 'local', Mountpoint: '/var/lib/docker/volumes/mongo-data/_data' },
    { Name: 'postgres-data', Driver: 'local', Mountpoint: '/var/lib/docker/volumes/postgres-data/_data' },
    { Name: 'app-config', Driver: 'local', Mountpoint: '/var/lib/docker/volumes/app-config/_data' },
];

// MOCK API Functions
export const getDashboardStats = async () => {
  await new Promise(res => setTimeout(res, 500));
  const runningContainers = MOCK_CONTAINERS.filter(c => c.State === 'running').length;
  const stoppedContainers = MOCK_CONTAINERS.filter(c => c.State !== 'running').length;
  return {
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    memoryLimit: 16, // GB
    totalImages: MOCK_IMAGES.length,
    runningContainers,
    stoppedContainers,
    totalContainers: MOCK_CONTAINERS.length,
    totalNetworks: MOCK_NETWORKS.length,
    totalVolumes: MOCK_VOLUMES.length,
  };
};

export const getContainers = async () => {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_CONTAINERS;
}

export const getImages = async () => {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_IMAGES;
}

export const getNetworks = async () => {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_NETWORKS;
}

export const getVolumes = async () => {
    await new Promise(res => setTimeout(res, 500));
    return MOCK_VOLUMES;
}

export const searchDockerHub = async (repo: string): Promise<DockerHubImage | null> => {
    if(!repo) return null;
    try {
        const response = await fetch(`https://hub.docker.com/v2/repositories/library/${repo}/`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch from Docker Hub');
        }
        const data = await response.json();

        // Use GenAI to render markdown
        const { renderedHtml } = await renderMarkdownDescription({ markdown: data.description || 'No description available.' });
        
        return {
            name: data.name,
            description: data.description,
            renderedDescription: renderedHtml,
            last_updated: data.last_updated,
            pull_count: data.pull_count,
            star_count: data.star_count,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getContainerLogs = async (containerId: string) => {
    await new Promise(res => setTimeout(res, 500));
    const logs = [
        `[${new Date().toISOString()}] Starting container ${containerId}...`,
        `[${new Date().toISOString()}] Attaching to ${containerId}`,
        `[${new Date().toISOString()}] Log stream connected.`,
        `[${new Date().toISOString()}] GET /index.html 200 - OK`,
        `[${new Date().toISOString()}] GET /styles.css 200 - OK`,
        `[${new Date().toISOString()}] GET /app.js 200 - OK`,
    ];
    return logs;
}
