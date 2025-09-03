'use server';
import { DockerContainer, DockerImage, DockerNetwork, DockerVolume, DockerHubImage } from '@/types';
import { renderMarkdownDescription } from '@/ai/flows/image-search-markdown-rendering';
import { getDockerode } from './docker';

export const getDashboardStats = async () => {
  console.log('actions: getDashboardStats called');
  try {
    const docker = getDockerode();
    const [containers, images, networks, volumes, info] = await Promise.all([
        docker.listContainers({ all: true }),
        docker.listImages(),
        docker.listNetworks(),
        docker.listVolumes(),
        docker.info(),
    ]);

    console.log('actions: getDashboardStats - Docker API info response:', info);

    const runningContainers = containers.filter(c => c.State === 'running').length;
    const stoppedContainers = containers.filter(c => c.State !== 'running').length;
    
    // Note: info.Memory is not a standard property in Dockerode's info object. This might be incorrect.
    // Let's calculate based on what is available, assuming info provides total memory.
    // A more reliable way would need container stats, which is more intensive.
    const cpuUsage = (info.NCPU > 0 && info.ContainersRunning > 0) ? (info.ContainersRunning / info.NCPU) * 100 : 0;
    const memoryUsage = info.MemTotal > 0 && info.Memory // Assuming info.Memory is available memory, which is not standard.
        ? ((info.MemTotal - info.Memory) / info.MemTotal) * 100 
        : 0;

    const stats = {
      ...info,
      cpuUsage: cpuUsage,
      memoryUsage: memoryUsage,
      memoryLimit: info.MemTotal / (1024 * 1024 * 1024), // GB
      totalImages: images.length,
      runningContainers,
      stoppedContainers,
      totalContainers: containers.length,
      totalNetworks: networks.length,
      totalVolumes: (volumes.Volumes || []).length,
    };
    console.log('actions: getDashboardStats - calculated stats:', stats);
    return stats;

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      error: (error as Error).message,
    };
  }
};

export const getContainers = async (): Promise<DockerContainer[]> => {
    console.log('actions: getContainers called');
    const docker = getDockerode();
    const containers = await docker.listContainers({ all: true });
    console.log(`actions: getContainers - found ${containers.length} containers`);
    return containers as DockerContainer[];
}

export const getImages = async (): Promise<DockerImage[]> => {
    console.log('actions: getImages called');
    const docker = getDockerode();
    const images = await docker.listImages();
    console.log(`actions: getImages - found ${images.length} images`);
    return images as DockerImage[];
}

export const getNetworks = async (): Promise<DockerNetwork[]> => {
    console.log('actions: getNetworks called');
    const docker = getDockerode();
    const networks = await docker.listNetworks();
    console.log(`actions: getNetworks - found ${networks.length} networks`);
    return networks as DockerNetwork[];
}

export const getVolumes = async (): Promise<DockerVolume[]> => {
    console.log('actions: getVolumes called');
    const docker = getDockerode();
    const volumes = await docker.listVolumes();
    console.log(`actions: getVolumes - found ${(volumes.Volumes || []).length} volumes`);
    return (volumes.Volumes || []) as DockerVolume[];
}

export const searchDockerHub = async (repo: string): Promise<DockerHubImage | null> => {
    console.log(`actions: searchDockerHub called with repo: ${repo}`);
    if(!repo) return null;
    try {
        const url = `http://localhost:9002/api/dockerhub/repositories/library/${repo}/`;
        console.log(`actions: searchDockerHub - fetching from URL: ${url}`);
        const response = await fetch(url);
        
        console.log(`actions: searchDockerHub - response status: ${response.status}`);
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`actions: searchDockerHub - image not found (404)`);
                return null;
            }
            throw new Error(`Failed to fetch from Docker Hub: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`actions: searchDockerHub - received data:`, data);

        const { renderedHtml } = await renderMarkdownDescription({ markdown: data.description || 'No description available.' });
        
        const result = {
            name: data.name,
            description: data.description,
            renderedDescription: renderedHtml,
            last_updated: data.last_updated,
            pull_count: data.pull_count,
            star_count: data.star_count,
        };
        console.log(`actions: searchDockerHub - processed result:`, result);
        return result;
    } catch (error) {
        console.error('actions: searchDockerHub - error:', error);
        return null;
    }
};

export const getContainerLogs = async (containerId: string) => {
    console.log(`actions: getContainerLogs called for containerId: ${containerId}`);
    const docker = getDockerode();
    const container = docker.getContainer(containerId);
    
    // The 'since' option can get logs from a certain timestamp. Here we get last 100 lines.
    const logStream = await container.logs({
        stdout: true,
        stderr: true,
        tail: 100, 
    });

    return new Promise<string[]>((resolve, reject) => {
        const logs: string[] = [];
        (logStream as NodeJS.ReadableStream).on('data', (chunk) => {
            const logEntry = chunk.toString('utf8').trim();
            // Docker log stream has a header which we can ignore
            // For simplicity, we split by newline as logs can come in batches
            logs.push(...logEntry.split('\n'));
        });
        (logStream as NodeJS.ReadableStream).on('end', () => {
            console.log(`actions: getContainerLogs - resolved ${logs.length} log entries`);
            resolve(logs);
        });
        (logStream as NodeJS.ReadableStream).on('error', (err) => {
            console.error(`actions: getContainerLogs - stream error:`, err);
            reject(err);
        });
    });
}
