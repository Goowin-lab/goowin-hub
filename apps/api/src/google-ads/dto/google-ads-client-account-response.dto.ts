import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoogleAdsStatus } from '@prisma/client';

export class GoogleAdsClientAccountResponseDto {
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

  @ApiPropertyOptional({ format: 'date', nullable: true, type: Date })
  latestMovementDate!: Date | null;
}
