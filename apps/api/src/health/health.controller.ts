import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthCheckResult, HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check backend and database health' })
  @ApiOkResponse({ description: 'Current backend and database health status.' })
  async check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}
