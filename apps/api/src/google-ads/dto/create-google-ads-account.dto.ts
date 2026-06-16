import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoogleAdsStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateGoogleAdsAccountDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  clientId!: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  accountName!: string;

  @ApiPropertyOptional({
    description: 'Google Ads Customer ID.',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  customerId?: string;

  @ApiPropertyOptional({
    default: GoogleAdsStatus.ACTIVE,
    enum: GoogleAdsStatus,
    enumName: 'GoogleAdsStatus',
  })
  @IsOptional()
  @IsEnum(GoogleAdsStatus)
  status?: GoogleAdsStatus;

  @ApiPropertyOptional({ default: 'COP', minLength: 3, maxLength: 3 })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  currencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
