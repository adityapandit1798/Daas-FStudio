export interface DockerContainer {
    Id: string;
    Names: string[];
    Image: string;
    State: 'running' | 'exited' | 'created' | 'restarting' | 'paused';
    Status: string;
    Ports: { PrivatePort: number; PublicPort: number; Type: string }[];
}

export interface DockerImage {
    Id: string;
    RepoTags: string[];
    Created: number;
    Size: number;
}

export interface DockerNetwork {
    Id: string;
    Name: string;
    Driver: string;
    Scope: string;
}

export interface DockerVolume {
    Name: string;
    Driver: string;
    Mountpoint: string;
}

export interface DockerHubImage {
    name: string;
    description: string;
    renderedDescription: string;
    star_count: number;
    pull_count: number;
    last_updated: string;
}
