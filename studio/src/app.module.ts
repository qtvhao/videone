import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrowserModule } from './browser/browser.module';
import { CloudflaredService } from './cloudflared/cloudflared.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    BrowserModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudflaredService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly cloudflaredService: CloudflaredService) {}

  async onModuleInit() {
    // Start the tunnel when the application starts
    await this.cloudflaredService.startTunnel();
  }
}
