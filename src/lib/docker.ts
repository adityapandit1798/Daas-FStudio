import Docker, { DockerOptions } from 'dockerode';
import { cookies } from 'next/headers';
import { DockerConnection } from '@/contexts/DockerContext';

export function getDockerode(): Docker {
    console.log('docker: getDockerode called');
    const cookieStore = cookies();
    const connectionCookie = cookieStore.get('dockerConnection');

    if (!connectionCookie) {
        console.error('docker: No Docker connection details found in cookies.');
        throw new Error('No Docker connection details found in cookies.');
    }

    const connection: DockerConnection = JSON.parse(connectionCookie.value);
    console.log('docker: Parsed connection details from cookie:', connection);


    const [host, portStr] = connection.host.split(':');
    const port = portStr ? parseInt(portStr, 10) : (connection.protocol === 'https' ? 2376 : 2375);

    const dockerOptions: DockerOptions = {
        host: host,
        port: port,
        protocol: connection.protocol,
    };

    if (connection.protocol === 'https') {
        console.log('docker: HTTPS protocol detected, applying TLS options.');
        if (connection.ca && connection.cert && connection.key) {
            dockerOptions.ca = connection.ca;
            dockerOptions.cert = connection.cert;
            dockerOptions.key = connection.key;
            console.log('docker: TLS certificates and key have been applied to DockerOptions.');
        } else {
            console.warn('docker: HTTPS protocol is used, but one or more certificate/key parts are missing.');
        }
    }

    console.log('docker: Final DockerOptions being used:', {
        ...dockerOptions,
        // Avoid logging the actual certs
        ca: dockerOptions.ca ? '[present]' : '[not present]',
        cert: dockerOptions.cert ? '[present]' : '[not present]',
        key: dockerOptions.key ? '[present]' : '[not present]',
    });

    const newDockerode = new Docker(dockerOptions);
    return newDockerode;
}
