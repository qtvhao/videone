import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { tunnel } from 'cloudflared';

@Injectable()
export class CloudflaredService implements OnModuleDestroy {
  private childProcess;

  async startTunnel() {
    console.log('Cloudflared Tunnel Example.');

    try {
      const { url, connections, child, stop } = tunnel({ '--hello-world': null });

      // Save child process to stop it later
      this.childProcess = child;

      // Show the URL
      console.log('LINK:', await url);

      // Wait for all 4 connections to be established
      const conns = await Promise.all(connections);

      // Show the connections
      console.log('Connections Ready!', conns);

      // Stop the tunnel after 15 seconds (optional)
      setTimeout(stop, 15_000);

      // Handle exit
      child.on('exit', (code) => {
        console.log('Tunnel process exited with code', code);
      });
    } catch (error) {
      console.error('Failed to start Cloudflared tunnel:', error);
    }
  }

  // Stop the process when the application shuts down
  onModuleDestroy() {
    if (this.childProcess) {
      this.childProcess.kill();
      console.log('Cloudflared tunnel stopped.');
    }
  }
}