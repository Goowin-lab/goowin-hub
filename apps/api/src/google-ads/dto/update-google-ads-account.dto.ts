import { ApiPropertyOptional } from '@nestjs/swagger';
import { GoogleAdsStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateGoogleAdsAccountDto {
  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  accountName?: string;

  @ApiPropertyOptional({
    description: 'Google Ads Customer ID.',
    maxLength: 80,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  customerId?: string;

  @ApiPropertyOptional({
    enum: GoogleAdsStatus,
    enumName: 'GoogleAdsStatus',
  })
  @IsOptional()
  @IsEnum(GoogleAdsStatus)
  status?: GoogleAdsStatus;

  @ApiPropertyOptional({ minLength: 3, maxLength: 3 })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  currencyCode?: string;

  @ApiPropertyOptional({
    description: 'Commercial CPC multiplier configured per account.',
    example: '1.50',
    type: String,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  cpcMultiplier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
