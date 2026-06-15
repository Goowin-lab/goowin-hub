import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export type HealthCheckResult = {
  status: 'ok' | 'error';
  backend: {
    status: 'up';
    timestamp: string;
  };
  database: {
    status: 'up' | 'down';
  };
};

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const backend = {
      status: 'up' as const,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.prismaService.isHealthy();

      return {
        backend,
        database: {
          status: 'up',
        },
        status: 'ok',
      };
    } catch {
      return {
        backend,
        database: {
          status: 'down',
        },
        status: 'error',
      };
    }
  }
}
