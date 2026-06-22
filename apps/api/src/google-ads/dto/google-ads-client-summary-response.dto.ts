import { ApiProperty } from '@nestjs/swagger';

export class GoogleAdsClientSummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  clientId!: string;

  @ApiProperty()
  currencyCode!: string;

  @ApiProperty({ type: String })
  balance!: string;

  @ApiProperty()
  monthConversions!: number;

  @ApiProperty()
  monthClicks!: number;

  @ApiProperty({ type: String })
  monthConsumption!: string;

  @ApiProperty({ type: String })
  monthTopUps!: string;

  @ApiProperty()
  activeAccounts!: number;

  @ApiProperty({ format: 'date' })
  periodStart!: Date;

  @ApiProperty({ format: 'date' })
  periodEnd!: Date;
}
