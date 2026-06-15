import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { AppLoggerService } from '../logger/app-logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: AppLoggerService) {
    super();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('PostgreSQL connection established', PrismaService.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Prisma connection error';
      this.logger.warn(
        `PostgreSQL initial connection failed; health checks will report database down. ${message}`,
        PrismaService.name,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async isHealthy(): Promise<boolean> {
    await this.$queryRaw`SELECT 1`;
    return true;
  }
}
