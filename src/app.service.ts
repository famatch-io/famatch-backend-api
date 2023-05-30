import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Notification } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getTestNotis(): Promise<Notification[]> {
    return this.prisma.notification.findMany();
  }
  async generateOneTestNoti(): Promise<Notification> {
    const totalCount = await this.prisma.notification.count();
    return this.prisma.notification.create({
      data: {
        content: 'Hello World',
        title: `${totalCount} notification`,
      },
    });
  }
}
