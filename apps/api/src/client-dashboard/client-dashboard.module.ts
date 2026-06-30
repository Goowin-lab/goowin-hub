import { Module } from '@nestjs/common';

import {
  ClientDashboardController,
  ClientDashboardDevelopmentController,
} from './client-dashboard.controller';
import { ClientDashboardService } from './client-dashboard.service';

@Module({
  controllers: [
    ClientDashboardController,
    ClientDashboardDevelopmentController,
  ],
  providers: [ClientDashboardService],
})
export class ClientDashboardModule {}
