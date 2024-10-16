import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as childProcess from 'child_process';

@Injectable()
export class CloudflaredService implements OnModuleDestroy {
  private childProcess;

  async startTunnel() {
    try {
      // Check if cloudflared is installed
      const check = childProcess.spawnSync('cloudflared', ['--version']);
      if (check.error) {
        throw new Error('Cloudflared is not installed.');
      }
      console.log('Starting Cloudflared tunnel...');
      const child = childProcess.spawn(
        'cloudflared',
        ['tunnel', '--url', 'http://localhost:3000'],
        {
          // stdio: 'inherit',
        },
      );
      // console.log('Cloudflared tunnel started.');

      // Save child process to stop it later
      this.childProcess = child;

      // Show the URL
      const url = new Promise((resolve) => {
        const url_regex = /\|\s+(https?:\/\/[^\s]+)/;
        let parser = (data: Buffer) => {
          const match = url_regex.exec(data.toString());
          if (match) {
            resolve(match[1]);
          }
        };
        child.stdout.on('data', parser);
        child.stderr.on('data', parser);
      });
      console.log('LINK:', await url);

      // // Wait for all 4 connections to be established
      // const conns = await Promise.all(connections);

      // // Show the connections
      console.log('Connections Ready!');

      // // Stop the tunnel after 15 seconds (optional)
      // //   setTimeout(stop, 15_000);

      // // Handle exit
      // child.on('exit', (code) => {
      //   console.log('Tunnel process exited with code', code);
      // });
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
