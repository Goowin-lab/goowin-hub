import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDecimal,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGoogleAdsDailyMovementDto {
  @ApiProperty({
    description: 'Daily movement date.',
    format: 'date',
    type: String,
  })
  @Type(() => Date)
  @IsDate()
  movementDate!: Date;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  conversions?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  clicks?: number;

  @ApiProperty({
    description: 'Internal cost CPC. This value is visible only to Goowin admins.',
    example: '911.00',
    type: String,
  })
  @IsDecimal({ decimal_digits: '0,2' })
  cpcCost!: string;

  @ApiPropertyOptional({
    default: '0.00',
    description: 'Daily advertising consumption.',
    type: String,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  consumption?: string;

  @ApiPropertyOptional({
    default: '0.00',
    description: 'Daily top-up amount.',
    type: String,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  topUp?: string;

  @ApiPropertyOptional({
    description:
      'Available balance after this daily movement. If omitted, it is calculated from the previous daily movement.',
    type: String,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  balance?: string;

  @ApiPropertyOptional({ description: 'Operational note.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
