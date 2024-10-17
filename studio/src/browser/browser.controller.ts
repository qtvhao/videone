import { Controller, Get, Post, Query, Body, UseInterceptors } from '@nestjs/common';
import { BrowserService } from './browser.service';

@Controller('browser')
export class BrowserController {
  constructor(private readonly browserService: BrowserService) {}

  @Get('content')
  async getPageContent(@Query('url') url: string = ''): Promise<string> {
    return this.browserService.getPageContent(url);
  }

  @Post('typeOnFocused')
  async typeOnFocused(@Body() body: { selector: string, matcher: string, text: string}) {
    const { selector, matcher, text } = body;
    return this.browserService.typeOnFocused(selector, matcher, text);
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

  @Post('goto')
  async gotoPage(@Body() body: { url: string }): Promise<void> {
    const { url } = body;
    this.browserService.gotoPage(url);
  }

  @Post('updateDetails')
  async updateDetails(@Body() body: { videoUrl: string, title: string, hashtags: string, description: string }): Promise<void> {
    const { videoUrl, title, hashtags, description } = body;
    await this.browserService.updateDetails(videoUrl, title, hashtags, description);
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
