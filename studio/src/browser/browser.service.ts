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
    await this.waitForChrome();
    if (!this.browser) {
      this.browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
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
      // console.log('Waiting for Chrome to be ready...');
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
    return new Promise((resolve) => setTimeout(resolve, ms));
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
  async clickButtonSave(immediately_break = false) {
    const page = await this.getFirstPage();
    let saveButton;
    while (typeof saveButton === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 10_000));
        console.log('Waiting for save button');
        let filledButtons = await page.$$('ytcp-button[type=filled]');
        for (let button of filledButtons) {
            let text = await page.evaluate((el: HTMLElement) =>               el.innerText, button);
            // if (text.includes('SAVE')) {
            if (text && text.toUpperCase() === 'SAVE') {
                saveButton = button;
                break;
            }
        }
        if (immediately_break) {
            break;
        }
    }
    await saveButton.click();
}

  async typeOnFocused(selector: string, matcher: string, text: string) {
    const page = await this.getFirstPage();
    for (let i = 0; i < 200; i++) {
      await page.keyboard.press('Tab');
      let $el = await page.$(selector);
      if ($el) {
        console.log('Focused:', $el);
        let borderColor = await page.evaluate((el) => {
          return getComputedStyle(el).borderColor;
        }, $el);
        let innerText = await page.evaluate((el: HTMLElement) => {
          return el.innerText;
        }, $el);
        let inputsText = await page.evaluate((el) => {
          let inputs = Array.from(el.querySelectorAll('input'));

          return inputs.map((input) => input.placeholder);
        }, $el);
        // console.log('Inputs text:', inputsText);
        innerText += ' ' + inputsText.join(' ');
        if (innerText.includes(matcher)) {
          console.log('Typing:', text);
          // await page.keyboard.down('Control');
          // await page.keyboard.press('KeyA');
          // await page.keyboard.up('Control');
          // await page.keyboard.press('Backspace');
          for (let i = 0; i < 5000; i++) {
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('Backspace');
          }
          await page.keyboard.type(text);
          break;
        } else {
          console.log('Inner text:', innerText);
          console.log('Border color:', borderColor);
        }
      } else {
        // console.log('Pressing Tab:', i, 'matcher', matcher);
      }
    }
  }
  async updateDetails(
    videoUrl: string,
    title: string,
    hashtags: string,
    description: string,
  ): Promise<void> {
    
  }

  async uploadFile(
    url: string,
    pathname,
    waitForSelector: string,
    fileUrl: string,
  ): Promise<string> {
    const page = await this.gotoPage(url);
    const pageUrl = page.url();
    console.log('Current URL:', pageUrl);
    await this.gotoPage(pageUrl + pathname);
    await page.waitForSelector(waitForSelector);
    const input = (await page.$(
      waitForSelector,
    )) as puppeteer.ElementHandle<HTMLInputElement>;
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
  async clickElement(
    selector: string,
    text: string,
    times: number,
  ): Promise<void> {
    const page = await this.getFirstPage();
    await page.waitForSelector(selector);
    for (let i = 0; i < times; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      if (text === '') {
        await page.click(selector);
      } else {
        let elements = await page.$$(selector);
        for (let element of elements) {
          const textContent = await page.evaluate(
            (element) => element.textContent,
            element,
          );
          console.log('Element text content:', textContent);
          if (textContent === text) {
            await element.click();
            break;
          }
        }
      }
    }
  }

  async getTextContent(selector: string, find: string): Promise<string> {
    const page = await this.getFirstPage();
    let elements = await page.$$(selector);
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const textContent = await page.evaluate(
        (element) => element.textContent,
        element,
      );
      if (textContent.indexOf(find) !== -1) {
        return textContent;
      }
    }
  }

  async getPageContent(url: string = ''): Promise<string> {
    let page = null;
    if (url === '') {
      page = await this.getFirstPage();
    } else {
      page = await this.gotoPage(url);
    }
    const content = await page.evaluate(
      () => document.documentElement.innerText,
    );
    return content;
  }

  private spawnChrome(): void {
    console.log('Spawning Chrome...');
    const platform = os.platform();
    let chromePath: string;

    if (platform === 'darwin') {
      // MacOS
      chromePath =
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else if (platform === 'win32') {
      // Windows
      chromePath =
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    } else if (platform === 'linux') {
      // Linux
      chromePath = '/usr/bin/google-chrome';
    } else {
      throw new Error('Unsupported platform: ' + platform);
    }

    const chromeProcess = spawn(
      chromePath,
      [
        '--remote-debugging-port=9222',
        // '--disable-gpu',
        // '--no-sandbox'
      ],
      {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    chromeProcess.on('error', (err) => {
      // console.error('Failed to start Chrome:', err);
    });

    chromeProcess.stdout.on('data', (data) => {
      // console.log(`Chrome stdout: ${data}`);
    });

    chromeProcess.stderr.on('data', (data) => {
      // console.log(`Chrome stderr: ${data}`);
    });
  }

  onModuleDestroy() {
    if (this.browser) {
      this.browser.close();
    }
  }
}
