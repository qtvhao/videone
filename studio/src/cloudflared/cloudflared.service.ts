import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as childProcess from 'child_process';

@Injectable()
export class CloudflaredService implements OnModuleDestroy {
  private childProcess: childProcess.ChildProcess | null = null;

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

      const conn_regex = /connection[= ]([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      const ip_regex = /ip=([0-9.]+)/;
      const location_regex = /location=([A-Za-z0-9]+)/;
      const index_regex = /connIndex=(\d)/;

      const import_regex = {
        conn_regex,
        ip_regex,
        location_regex,
        index_regex,
      };
      // Show the URL
      const url = new Promise((resolve) => {
        let url: string | null = null;
        const url_regex = /\|\s+(https?:\/\/[^\s]+)/;
        let parser = (data: Buffer) => {
          const match = url_regex.exec(data.toString());
          if (match) {
            url = match[1];
          }

          const conn_match = data.toString().match(import_regex.conn_regex);
          const ip_match = data.toString().match(import_regex.ip_regex);
          const location_match = data.toString().match(import_regex.location_regex);
          const index_match = data.toString().match(import_regex.index_regex);
          if (conn_match && ip_match && location_match && index_match) {
            const [, id] = conn_match;
            const [, ip] = ip_match;
            const [, location] = location_match;
            const [, idx] = index_match;
            console.log('Connection:', { id, ip, location, idx });
            resolve(url);
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
