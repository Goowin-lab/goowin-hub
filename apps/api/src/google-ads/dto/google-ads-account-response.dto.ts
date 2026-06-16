import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoogleAdsStatus } from '@prisma/client';

export class GoogleAdsAccountResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  clientId!: string;

  @ApiProperty()
  clientName!: string;

  @ApiProperty({ format: 'uuid' })
  serviceId!: string;

  @ApiProperty()
  accountName!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  customerId!: string | null;

  @ApiProperty({ enum: GoogleAdsStatus, enumName: 'GoogleAdsStatus' })
  status!: GoogleAdsStatus;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty({
    description: 'Calculated balance: top-ups minus consumptions.',
    type: String,
  })
  balance!: string;

  @ApiProperty({ type: String })
  totalTopUps!: string;

  @ApiProperty({ type: String })
  totalConsumptions!: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true, type: Date })
  lastTopUpAt!: Date | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  lastTopUpAmount!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true, type: Date })
  lastConsumptionAt!: Date | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  lastConsumptionAmount!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
