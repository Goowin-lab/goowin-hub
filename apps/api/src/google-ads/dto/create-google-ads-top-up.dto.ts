import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDecimal,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateGoogleAdsTopUpDto {
  @ApiProperty({
    description: 'Top-up amount as a decimal string.',
    example: '500000.00',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  amount!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  toppedUpAt?: Date;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @ApiPropertyOptional({ description: 'Operational note.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
