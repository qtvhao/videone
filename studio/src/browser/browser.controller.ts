import { Controller, Get, Query } from '@nestjs/common';
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

  @Get('upload')
  async uploadFile(@Query('url') url: string, @Query('waitForSelector') waitForSelector: string, @Query('file') fileUrl: string): Promise<{ upload: string, status: string }> {
    let uploadUrl = await this.browserService.uploadFile(url, waitForSelector, fileUrl);

    return {
      upload: uploadUrl,
      status: 'success'
    }
  }
}
