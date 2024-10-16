import { Controller, Get, Post, Query, Body, UseInterceptors } from '@nestjs/common';
import { BrowserService } from './browser.service';
import { CorsInterceptor } from '../interceptors/cors.interceptor';

@Controller('browser')
@UseInterceptors(CorsInterceptor)
export class BrowserController {
  constructor(private readonly browserService: BrowserService) {}

  @Get('content')
  async getPageContent(@Query('url') url: string = ''): Promise<string> {
    return this.browserService.getPageContent(url);
  }

  @Post('clickElement')
  async clickElement(@Body() body: { selector: string, text: string, times: number }): Promise<void> {
    const { selector, text, times } = body;
    return this.browserService.clickElement(selector, text, times);
  }

  @Get('getTextContent')
  async getTextContent(@Query('selector') selector: string, @Query('find') find: string): Promise<string> {
    return this.browserService.getTextContent(selector, find);
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
