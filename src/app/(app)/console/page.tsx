'use client';

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Terminal } from 'lucide-react';

export default function ConsolePage() {
  const [authMethod, setAuthMethod] = React.useState('password');

  return (
    <div>
      <PageHeader title="Host Console" description="Get direct terminal access to the Docker host." />
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Connect to Host</CardTitle>
                    <CardDescription>Enter SSH credentials to connect.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="host-user">Username</Label>
                        <Input id="host-user" placeholder="e.g., root, admin" />
                    </div>
                    <div>
                        <Label>Authentication Method</Label>
                         <RadioGroup defaultValue="password" onValueChange={setAuthMethod} className="mt-2 flex">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="password" id="r1" />
                                <Label htmlFor="r1">Password</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="key" id="r2" />
                                <Label htmlFor="r2">SSH Key</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {authMethod === 'password' && (
                        <div>
                            <Label htmlFor="host-password">Password</Label>
                            <Input id="host-password" type="password" />
                        </div>
                    )}

                    {authMethod === 'key' && (
                        <div>
                            <Label htmlFor="host-key">Private SSH Key (.pem)</Label>
                            <Textarea id="host-key" placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----" className="font-code" rows={5}/>
                        </div>
                    )}
                    
                    <Button className="w-full">Connect</Button>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Terminal/> Console</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-black text-green-400 font-code h-96 w-full rounded-md p-4 text-sm overflow-y-auto">
                        <p># Welcome to DockWatch Host Console</p>
                        <p># This is a visual placeholder for an xterm.js terminal.</p>
                        <p># Enter your credentials and click "Connect" to start a session.</p>
                        <p className="flex items-center">
                            <span className="text-blue-400">user@dockwatch</span>:<span className="text-purple-400">~</span>$ 
                            <span className="ml-2 w-2 h-4 bg-green-400 animate-pulse"></span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
