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
      await this.waitForChrome();
      this.browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222'
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
    }
  }

  private async waitForChrome(): Promise<void> {
    const url = 'http://localhost:9222/json/version';
    while (true) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          break;
        }
      } catch (error) {
        // Ignore errors and retry
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async getScreenshot(url: string): Promise<Uint8Array> {
    await this.initBrowser();
    const page = await this.browser.newPage();
    await page.goto(url);
    const screenshot = await page.screenshot();
    return screenshot;
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
