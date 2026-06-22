import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoogleAdsStatus } from '@prisma/client';

import { GoogleAdsClientDailyMovementResponseDto } from './google-ads-client-daily-movement-response.dto';

export class GoogleAdsClientAccountDetailResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  accountName!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  customerId!: string | null;

  @ApiProperty({ enum: GoogleAdsStatus, enumName: 'GoogleAdsStatus' })
  status!: GoogleAdsStatus;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty({ type: String })
  balance!: string;

  @ApiProperty()
  conversions!: number;

  @ApiProperty()
  clicks!: number;

  @ApiProperty({ type: String })
  consumption!: string;

  @ApiProperty({ type: String })
  topUp!: string;

  @ApiProperty({ format: 'date' })
  periodStart!: Date;

  @ApiProperty({ format: 'date' })
  periodEnd!: Date;

  @ApiProperty({
    type: GoogleAdsClientDailyMovementResponseDto,
    isArray: true,
  })
  movements!: GoogleAdsClientDailyMovementResponseDto[];
}
