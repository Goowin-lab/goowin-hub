import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleAdsTopUpResponseDto {
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
  toppedUpAt!: Date;

  @ApiPropertyOptional({ nullable: true, type: String })
  reference!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
