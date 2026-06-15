import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientCommercialStatus } from '@prisma/client';

export class ClientResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  legalName!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  taxId!: string | null;

  @ApiPropertyOptional({ format: 'email', nullable: true, type: String })
  billingEmail!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  phone!: string | null;

  @ApiProperty({
    enum: ClientCommercialStatus,
    description:
      'CURRENT=Al dia, PAYMENT_PENDING=Pago pendiente, FOLLOW_UP=En seguimiento, SUSPENDED=Suspendido.',
  })
  commercialStatus!: ClientCommercialStatus;

  @ApiPropertyOptional({ nullable: true, type: String })
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
