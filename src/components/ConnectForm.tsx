'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, ShipWheel } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocker } from '@/contexts/DockerContext';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  host: z.string().min(1, { message: 'Host IP or domain is required.' }),
  protocol: z.enum(['http', 'https'], { required_error: 'You need to select a protocol.' }),
  ca: z.string().optional(),
  cert: z.string().optional(),
  key: z.string().optional(),
});

export function ConnectForm() {
  const router = useRouter();
  const { setConnection } = useDocker();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: '',
      protocol: 'http',
    },
  });

  const protocol = form.watch('protocol');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    setConnection({
        host: values.host,
        protocol: values.protocol,
        ca: values.ca,
        cert: values.cert,
        key: values.key
    });
    
    toast({
        title: 'Connection Details Saved',
        description: `Now attempting to connect to ${values.host}.`,
    });

    // We don't know if the connection is successful until we try to load a page
    router.push('/dashboard');
    setIsLoading(false);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ShipWheel className="text-primary"/>
            Host Connection
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="protocol"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Protocol</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                      disabled={isLoading}
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="http" />
                        </FormControl>
                        <FormLabel className="font-normal">HTTP</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="https" />
                        </FormControl>
                        <FormLabel className="font-normal">HTTPS</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Docker Host IP:Port</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 192.168.1.100:2375" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {protocol === 'https' && (
              <div className="space-y-4 pt-4 border-t border-dashed">
                <p className="text-sm text-muted-foreground">
                    Paste the content of your TLS certificates for a secure connection.
                </p>
                <FormField
                  control={form.control}
                  name="ca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CA Certificate</FormLabel>
                      <FormControl>
                        <Textarea placeholder="-----BEGIN CERTIFICATE-----..." {...field} disabled={isLoading} rows={3} className="font-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="cert"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Certificate</FormLabel>
                      <FormControl>
                        <Textarea placeholder="-----BEGIN CERTIFICATE-----..." {...field} disabled={isLoading} rows={3} className="font-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Key</FormLabel>
                      <FormControl>
                         <Textarea placeholder="-----BEGIN RSA PRIVATE KEY-----..." {...field} disabled={isLoading} rows={3} className="font-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
