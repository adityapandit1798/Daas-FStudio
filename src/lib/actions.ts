'use server';
import { DockerContainer, DockerImage, DockerNetwork, DockerVolume, DockerHubImage } from '@/types';
import { renderMarkdownDescription } from '@/ai/flows/image-search-markdown-rendering';
import { getDockerode } from './docker';

// MOCK API Functions
export const getDashboardStats = async () => {
  const docker = getDockerode();
  const [containers, images, networks, volumes, info] = await Promise.all([
      docker.listContainers({ all: true }),
      docker.listImages(),
      docker.listNetworks(),
      docker.listVolumes(),
      docker.info(),
  ]);

  const runningContainers = containers.filter(c => c.State === 'running').length;
  const stoppedContainers = containers.filter(c => c.State !== 'running').length;
  
  // Approximating CPU and Memory. Dockerode info doesn't provide real-time usage directly.
  // This would typically require streaming stats.
  const cpuUsage = 0; // Placeholder
  const memoryUsage = info.MemTotal > 0 ? ((info.MemTotal - info.Memory) / info.MemTotal) * 100 : 0;


  return {
    cpuUsage: cpuUsage,
    memoryUsage: memoryUsage,
    memoryLimit: info.MemTotal / (1024 * 1024 * 1024), // GB
    totalImages: images.length,
    runningContainers,
    stoppedContainers,
    totalContainers: containers.length,
    totalNetworks: networks.length,
    totalVolumes: volumes.length,
  };
};

export const getContainers = async (): Promise<DockerContainer[]> => {
    const docker = getDockerode();
    const containers = await docker.listContainers({ all: true });
    return containers as DockerContainer[];
}

export const getImages = async (): Promise<DockerImage[]> => {
    const docker = getDockerode();
    const images = await docker.listImages();
    return images as DockerImage[];
}

export const getNetworks = async (): Promise<DockerNetwork[]> => {
    const docker = getDockerode();
    const networks = await docker.listNetworks();
    return networks as DockerNetwork[];
}

export const getVolumes = async (): Promise<DockerVolume[]> => {
    const docker = getDockerode();
    const volumes = await docker.listVolumes();
    return (volumes.Volumes || []) as DockerVolume[];
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
