import { Controller, Get, Query } from '@nestjs/common';
import { BrowserService } from './browser.service';

@Controller('browser')
export class BrowserController {
  constructor(private readonly browserService: BrowserService) {}

  @Get('content')
  async getPageContent(@Query('url') url: string): Promise<string> {
    return this.browserService.getPageContent(url);
  }
}
