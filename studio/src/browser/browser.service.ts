import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as os from 'os';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import { basename } from 'path';

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

  private async getFirstPage(): Promise<puppeteer.Page> {
    await this.initBrowser();
    const pages = await this.browser.pages();
    return pages[0];
  }
  async uploadFile(url: string, waitForSelector: string, fileUrl: string): Promise<void> {
    const page = await this.gotoPage(url);
    await page.waitForSelector(waitForSelector);
    const input = await page.$(waitForSelector) as puppeteer.ElementHandle<HTMLInputElement>;
    const file = await this.fetchFileUrlAsLocalFile(fileUrl);
    await input.uploadFile(file);
  }
  async fetchFileUrlAsLocalFile(fileUrl: string): Promise<string> {
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const fileSavePath = path.join(os.tmpdir(), basename(fileUrl));
    writeFileSync(fileSavePath, Buffer.from(buffer));
    return fileSavePath;
  }

  async gotoPage(url: string): Promise<puppeteer.Page> {
    const page = await this.getFirstPage();
    await page.goto(url);
    return page;
  }

  async getScreenshot(url: string): Promise<Uint8Array> {
    const page = await this.gotoPage(url);
    const screenshot = await page.screenshot();
    return screenshot;
  }

  async getPageContent(url: string): Promise<string> {
    const page = await this.gotoPage(url);
    const content = await page.content();
    return content;
  }

  onModuleDestroy() {
    if (this.browser) {
      this.browser.close();
    }
  }
}
