import { ApiProperty } from '@nestjs/swagger';

export class GoogleAdsClientDailyMovementResponseDto {
  @ApiProperty({ format: 'date' })
  movementDate!: Date;

  @ApiProperty()
  conversions!: number;

  @ApiProperty()
  clicks!: number;

  @ApiProperty({
    description: 'Client-visible CPC. This is the sale CPC, never cost CPC.',
    type: String,
  })
  cpc!: string;

  @ApiProperty({ type: String })
  consumption!: string;

  @ApiProperty({ type: String })
  topUp!: string;

  @ApiProperty({ type: String })
  balance!: string;
}
