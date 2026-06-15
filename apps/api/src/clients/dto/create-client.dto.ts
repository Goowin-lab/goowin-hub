import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientCommercialStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  taxId?: string;

  @ApiPropertyOptional({ format: 'email' })
  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @ApiPropertyOptional({ maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  phone?: string;

  @ApiPropertyOptional({
    enum: ClientCommercialStatus,
    default: ClientCommercialStatus.CURRENT,
    description:
      'CURRENT=Al dia, PAYMENT_PENDING=Pago pendiente, FOLLOW_UP=En seguimiento, SUSPENDED=Suspendido.',
  })
  @IsOptional()
  @IsEnum(ClientCommercialStatus)
  commercialStatus?: ClientCommercialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
