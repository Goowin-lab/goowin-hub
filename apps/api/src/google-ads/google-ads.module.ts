import { Module } from '@nestjs/common';

import {
  GoogleAdsClientDevelopmentController,
  GoogleAdsController,
} from './google-ads.controller';
import { GoogleAdsService } from './google-ads.service';

@Module({
  controllers: [GoogleAdsController, GoogleAdsClientDevelopmentController],
  providers: [GoogleAdsService],
})
export class GoogleAdsModule {}
