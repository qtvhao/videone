import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as os from 'os';
import { spawn } from 'child_process';

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private browser: puppeteer.Browser;

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.spawnChrome();
      this.browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222' // Assumes Chrome is running with remote debugging enabled
      });
    }
  }

  private spawnChrome(): void {
    const platform = os.platform();
    if (platform === 'darwin') {
      spawn(
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ['--remote-debugging-port=9222'],
        { detached: true }
      );
    } else if (platform === 'win32') {
      spawn(
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        ['--remote-debugging-port=9222'],
        { detached: true }
      );
    } else if (platform === 'linux') {
      spawn(
        '/usr/bin/google-chrome',
        ['--remote-debugging-port=9222'],
        { detached: true }
      );
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async getPageContent(url: string): Promise<string> {
    await this.initBrowser();
    const page = await this.browser.newPage();
    await page.goto(url);
    const content = await page.content();
    return content;
  }

  onModuleDestroy() {
    if (this.browser) {
      this.browser.close();
    }
  }
}
