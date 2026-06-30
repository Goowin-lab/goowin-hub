import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const clientDashboardAccountStatusValues = [
  'CURRENT',
  'PAYMENT_PENDING',
] as const;

export type ClientDashboardAccountStatus =
  (typeof clientDashboardAccountStatusValues)[number];

export const clientDashboardActivityTypeValues = [
  'GOOGLE_ADS_TOP_UP',
  'GOOGLE_ADS_MOVEMENT',
  'CAMPAIGN_UPDATED',
  'PAYMENT_APPLIED',
  'RENEWAL_COMPLETED',
  'TEMP',
] as const;

export type ClientDashboardActivityType =
  (typeof clientDashboardActivityTypeValues)[number];

export class ClientDashboardSummaryDto {
  @ApiProperty()
  activeServices!: number;

  @ApiProperty()
  upcomingRenewals!: number;

  @ApiProperty()
  pendingInvoices!: number;

  @ApiProperty({ type: String })
  googleAdsBalance!: string;

  @ApiProperty()
  notifications!: number;

  @ApiProperty({ enum: clientDashboardAccountStatusValues })
  accountStatus!: ClientDashboardAccountStatus;
}

export class ClientDashboardActivityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true, type: Date })
  occurredAt!: Date | null;

  @ApiProperty({ enum: clientDashboardActivityTypeValues })
  type!: ClientDashboardActivityType;

  @ApiPropertyOptional({ nullable: true, type: String })
  amount!: string | null;

  @ApiProperty()
  isTemporary!: boolean;
}

export class ClientDashboardServiceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  metricLabel!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  metricValue!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  href!: string | null;

  @ApiProperty()
  isAvailable!: boolean;

  @ApiProperty()
  isTemporary!: boolean;
}

export class ClientDashboardResponseDto {
  @ApiProperty({ type: ClientDashboardSummaryDto })
  summary!: ClientDashboardSummaryDto;

  @ApiProperty({ isArray: true, type: ClientDashboardActivityDto })
  recentActivity!: ClientDashboardActivityDto[];

  @ApiProperty({ isArray: true, type: ClientDashboardServiceDto })
  services!: ClientDashboardServiceDto[];
}
