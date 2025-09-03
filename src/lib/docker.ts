import Docker, { DockerOptions } from 'dockerode';
import { cookies } from 'next/headers';
import { DockerConnection } from '@/contexts/DockerContext';
import fs from 'fs';

let dockerode: Docker | null = null;

export function getDockerode(): Docker {
    const cookieStore = cookies();
    const connectionCookie = cookieStore.get('dockerConnection');

    if (!connectionCookie) {
        throw new Error('No Docker connection details found in cookies.');
    }

    const connection: DockerConnection = JSON.parse(connectionCookie.value);

    const [host, port] = connection.host.split(':');

    const dockerOptions: DockerOptions = {
        host: host,
        port: port || (connection.protocol === 'https' ? 2376 : 2375),
        protocol: connection.protocol,
    };

    if (connection.protocol === 'https' && connection.ca && connection.cert && connection.key) {
        dockerOptions.ca = connection.ca;
        dockerOptions.cert = connection.cert;
        dockerOptions.key = connection.key;
    }

    // This is a new instance per request, which is correct for server components
    // as each request has its own cookie context.
    const newDockerode = new Docker(dockerOptions);

    return newDockerode;
}
