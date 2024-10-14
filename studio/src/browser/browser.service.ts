import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private browser: puppeteer.Browser;

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch();
    }
  }

  async getPageContent(url: string): Promise<string> {
    await this.initBrowser();
    const page = await this.browser.newPage();
    await page.goto(url);
    const content = await page.content();
    await page.close();
    return content;
  }

  async goto(url: string): Promise<puppeteer.Page> {
    await this.initBrowser();
    const page = await this.browser.newPage();
    await page.goto(url);
    return page;
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
