import { ApiProperty } from '@nestjs/swagger';
import { ClientCommercialStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeClientCommercialStatusDto {
  @ApiProperty({
    enum: ClientCommercialStatus,
    description:
      'CURRENT=Al dia, PAYMENT_PENDING=Pago pendiente, FOLLOW_UP=En seguimiento, SUSPENDED=Suspendido.',
  })
  @IsEnum(ClientCommercialStatus)
  commercialStatus!: ClientCommercialStatus;
}
