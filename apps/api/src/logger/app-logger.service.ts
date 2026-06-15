import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends ConsoleLogger {
  constructor() {
    super('GoowinHubApi', {
      logLevels: ['error', 'warn', 'log', 'debug', 'verbose'],
      timestamp: true,
    });
  }
}
