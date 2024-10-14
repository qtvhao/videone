import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrowserModule } from './browser/browser.module';

@Module({
  imports: [
    BrowserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
