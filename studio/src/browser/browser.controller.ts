import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { BrowserService } from './browser.service';

@Controller('browser')
export class BrowserController {
  constructor(private readonly browserService: BrowserService) {}

  @Get('content')
  async getPageContent(@Query('url') url: string): Promise<string> {
    return this.browserService.getPageContent(url);
  }

  @Get('screenshot')
  async getScreenshot(@Query('url') url: string): Promise<Uint8Array> {
    return this.browserService.getScreenshot(url);
  }

  @Get('goto')
  async gotoPage(@Query('url') url: string): Promise<void> {
    this.browserService.gotoPage(url);
  }

  @Post('upload')
  async uploadFile(@Body() body: { url: string, urlPath: string, waitForSelector: string, file: string }): Promise<{ upload: string, status: string }> {
    const { url, urlPath, waitForSelector, file } = body;
    let uploadUrl = await this.browserService.uploadFile(url, urlPath, waitForSelector, file);

    return {
      upload: uploadUrl,
      status: 'success'
    }
  }
}
