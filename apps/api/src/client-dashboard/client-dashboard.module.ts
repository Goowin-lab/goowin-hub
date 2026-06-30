import { Module } from '@nestjs/common';

import { ClientDashboardController } from './client-dashboard.controller';
import { ClientDashboardService } from './client-dashboard.service';

@Module({
  controllers: [ClientDashboardController],
  providers: [ClientDashboardService],
})
export class ClientDashboardModule {}
