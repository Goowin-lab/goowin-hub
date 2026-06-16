import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsDecimal, IsOptional, IsString } from 'class-validator';

export class CreateGoogleAdsConsumptionDto {
  @ApiProperty({
    description: 'Consumed amount as a decimal string.',
    example: '125000.00',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  amount!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  consumedAt?: Date;

  @ApiPropertyOptional({ description: 'Operational note.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
