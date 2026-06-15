import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BillingCycle,
  ServiceCategory,
  ServiceTechnicalStatus,
  ServiceType,
} from '@prisma/client';

import {
  manageableBillingCycleValues,
  manageableServiceStatusValues,
  manageableServiceTypeValues,
} from './service-enums';

export class ServiceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  clientId!: string;

  @ApiProperty({ enum: manageableServiceTypeValues, enumName: 'ServiceType' })
  serviceType!: ServiceType;

  @ApiProperty({ enum: ServiceCategory, enumName: 'ServiceCategory' })
  category!: ServiceCategory;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    enum: manageableServiceStatusValues,
    enumName: 'ServiceStatus',
  })
  status!: ServiceTechnicalStatus;

  @ApiProperty({
    enum: manageableBillingCycleValues,
    enumName: 'BillingCycle',
  })
  billingCycle!: BillingCycle;

  @ApiPropertyOptional({ format: 'date-time', nullable: true, type: Date })
  renewalDate!: Date | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  amount!: string | null;

  @ApiProperty()
  currencyCode!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  provider!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
