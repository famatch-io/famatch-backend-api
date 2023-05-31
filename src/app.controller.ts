import { Controller, Get, Post } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-notifications')
  async getNotifications(): Promise<Notification[]> {
    return this.appService.getTestNotis();
  }

  @Post('test-notifications')
  async generateOneNotification(): Promise<Notification> {
    return this.appService.generateOneTestNoti();
  }
}
