import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleAdsDailyMovementAdminResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  clientId!: string;

  @ApiProperty()
  clientName!: string;

  @ApiProperty({ format: 'uuid' })
  googleAdsAccountId!: string;

  @ApiProperty()
  accountName!: string;

  @ApiProperty({ format: 'date' })
  movementDate!: Date;

  @ApiProperty()
  conversions!: number;

  @ApiProperty()
  clicks!: number;

  @ApiProperty({
    description: 'Internal cost CPC. Admin-only field.',
    type: String,
  })
  cpcCost!: string;

  @ApiProperty({
    description: 'Per-account commercial CPC multiplier. Admin-only field.',
    type: String,
  })
  cpcMultiplier!: string;

  @ApiProperty({
    description: 'Sale CPC calculated from cost CPC and account multiplier.',
    type: String,
  })
  cpcSale!: string;

  @ApiProperty({ type: String })
  consumption!: string;

  @ApiProperty({ type: String })
  topUp!: string;

  @ApiProperty({ type: String })
  balance!: string;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
