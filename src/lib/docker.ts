import Docker from 'dockerode';
import { cookies } from 'next/headers';
import { DockerConnection } from '@/contexts/DockerContext';

let dockerode: Docker | null = null;

export function getDockerode(): Docker {
    if (dockerode) {
        return dockerode;
    }

    const cookieStore = cookies();
    const connectionCookie = cookieStore.get('dockerConnection');

    if (!connectionCookie) {
        throw new Error('No Docker connection details found in cookies.');
    }

    const connection: DockerConnection = JSON.parse(connectionCookie.value);

    const [host, port] = connection.host.split(':');

    dockerode = new Docker({
        host: host,
        port: port || (connection.protocol === 'https' ? 2376 : 2375),
        protocol: connection.protocol,
        // Add logic for certs if needed
    });

    return dockerode;
}
