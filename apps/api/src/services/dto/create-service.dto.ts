import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BillingCycle,
  ServiceTechnicalStatus,
  ServiceType,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsDecimal,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

import {
  manageableBillingCycleValues,
  manageableServiceStatusValues,
  manageableServiceTypeValues,
} from './service-enums';

export class CreateServiceDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  clientId!: string;

  @ApiProperty({ enum: manageableServiceTypeValues, enumName: 'ServiceType' })
  @IsIn(manageableServiceTypeValues)
  serviceType!: ServiceType;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({
    enum: manageableServiceStatusValues,
    enumName: 'ServiceStatus',
    default: ServiceTechnicalStatus.ACTIVE,
  })
  @IsOptional()
  @IsIn(manageableServiceStatusValues)
  status?: ServiceTechnicalStatus;

  @ApiPropertyOptional({
    enum: manageableBillingCycleValues,
    enumName: 'BillingCycle',
  })
  @IsOptional()
  @IsIn(manageableBillingCycleValues)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  renewalDate?: Date;

  @ApiPropertyOptional({
    description: 'Decimal amount as a string, preserving cents when needed.',
    example: '190000.00',
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  amount?: string;

  @ApiPropertyOptional({ default: 'COP', minLength: 3, maxLength: 3 })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  currencyCode?: string;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
