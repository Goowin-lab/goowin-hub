import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleAdsDailyMovementClientResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  googleAdsAccountId!: string;

  @ApiProperty({ format: 'date' })
  movementDate!: Date;

  @ApiProperty()
  conversions!: number;

  @ApiProperty()
  clicks!: number;

  @ApiProperty({
    description: 'Client-visible CPC. This is the sale CPC, never the cost CPC.',
    type: String,
  })
  cpc!: string;

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
}
