import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as os from 'os';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { basename } from 'path';

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private browser: puppeteer.Browser;

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      await this.waitForChrome();
      this.browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222'
      });
    }
  }

  private async waitForChrome(): Promise<void> {
    const url = 'http://localhost:9222/json/version';
    const retryInterval = 1000; // 1 second

    if (await this.isChromeReady(url)) {
      console.log('Chrome is already ready.');
      return;
    }

    this.spawnChrome();

    while (true) {
      if (await this.isChromeReady(url)) {
        console.log('Chrome is ready.');
        break;
      }
      console.log('Waiting for Chrome to be ready...');
      await this.delay(retryInterval);
    }
  }

  private async isChromeReady(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getFirstPage(): Promise<puppeteer.Page> {
    await this.initBrowser();
    let pages = await this.browser.pages();
    if (pages.length === 0) {
      await this.browser.newPage();
      pages = await this.browser.pages();
    }
    return pages[0];
  }

  async uploadFile(url: string, pathname, waitForSelector: string, fileUrl: string): Promise<string> {
    const page = await this.gotoPage(url);
    const pageUrl = page.url();
    console.log('Current URL:', pageUrl);
    await this.gotoPage(pageUrl + pathname);
    await page.waitForSelector(waitForSelector);
    const input = await page.$(waitForSelector) as puppeteer.ElementHandle<HTMLInputElement>;
    const file = await this.fetchFileUrlAsLocalFile(fileUrl);
    console.log('Uploading file:', file);
    await input.uploadFile(file);

    return 'File uploaded';
  }

  async fetchFileUrlAsLocalFile(fileUrl: string): Promise<string> {
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    const fileSavePath = join(os.tmpdir(), basename(fileUrl));
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

  async getPageContent(url: string = ''): Promise<string> {
    let page = null;
    if (url === '') {
      page = await this.getFirstPage();
    }else{
      page = await this.gotoPage(url);
    }
    const content = await page.content();
    return content;
  }

  private spawnChrome(): void {
    const platform = os.platform();
    let chromePath: string;

    if (platform === 'darwin') {
      // MacOS
      chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else if (platform === 'win32') {
      // Windows
      chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    } else if (platform === 'linux') {
      // Linux
      chromePath = '/usr/bin/google-chrome';
    } else {
      throw new Error('Unsupported platform: ' + platform);
    }

    const chromeProcess = spawn(chromePath, [
      '--remote-debugging-port=9222',
      // '--disable-gpu',
      // '--no-sandbox'
    ]);

    chromeProcess.on('error', (err) => {
      console.error('Failed to start Chrome:', err);
    });

    chromeProcess.stdout.on('data', (data) => {
      console.log(`Chrome stdout: ${data}`);
    });

    chromeProcess.stderr.on('data', (data) => {
      console.log(`Chrome stderr: ${data}`);
    });
  }

  onModuleDestroy() {
    if (this.browser) {
      this.browser.close();
    }
  }
}
