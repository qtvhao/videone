import { 
  Controller, 
  Header,
  Get 
} from '@nestjs/common';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly httpService: HttpService
  ) {}

  @Get('ping')
  getPing(): string {
    return 'pong';
  }

  @Get()
  async proxyRequest(): Promise<any> {
    const response = await this.httpService.get('https://videone.pages.dev').toPromise();
    return response.data;
  }
  @Get('style.css')
  @Header('Content-Type', 'text/css')
  async getCss(): Promise<any> {
    const response = await this.httpService.get('https://videone.pages.dev/style.css').toPromise();
    return response.data;
  }
}
