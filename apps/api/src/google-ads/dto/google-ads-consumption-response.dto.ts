import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleAdsConsumptionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  clientId!: string;

  @ApiProperty({ format: 'uuid' })
  googleAdsAccountId!: string;

  @ApiProperty({ type: String })
  amount!: string;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty()
  consumedAt!: Date;

  @ApiPropertyOptional({ nullable: true, type: String })
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
