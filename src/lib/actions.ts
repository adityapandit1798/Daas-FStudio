'use server';
import { DockerContainer, DockerImage, DockerNetwork, DockerVolume, DockerHubImage } from '@/types';
import { renderMarkdownDescription } from '@/ai/flows/image-search-markdown-rendering';
import { getDockerode } from './docker';

export const getDashboardStats = async () => {
  try {
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
    
    const cpuUsage = (info.NCPU > 0 && info.ContainersRunning > 0) ? (info.ContainersRunning / info.NCPU) * 100 : 0;
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
      totalVolumes: (volumes.Volumes || []).length,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    // Return a default/error state
    return {
      cpuUsage: 0,
      memoryUsage: 0,
      memoryLimit: 0,
      totalImages: 0,
      runningContainers: 0,
      stoppedContainers: 0,
      totalContainers: 0,
      totalNetworks: 0,
      totalVolumes: 0,
      error: (error as Error).message,
    };
  }
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
        const response = await fetch(`http://localhost:9002/api/dockerhub/repositories/library/${repo}/`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch from Docker Hub');
        }
        const data = await response.json();

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
            // Docker logs stream has a header, we can strip it.
            // A simpler way for now is to just get the string content.
            logs.push(chunk.toString('utf8').trim());
        });
        (logStream as NodeJS.ReadableStream).on('end', () => {
            resolve(logs);
        });
        (logStream as NodeJS.ReadableStream).on('error', (err) => {
            reject(err);
        });
    });
}
