import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  clientId!: string | null;
}

export class AuthSessionResponseDto {
  @ApiProperty()
  authenticated!: boolean;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiPropertyOptional({ nullable: true })
  redirectTo!: string | null;
}

export class LoginResponseDto extends AuthSessionResponseDto {
  @ApiProperty()
  token!: string;
}

export class LogoutResponseDto {
  @ApiProperty()
  success!: boolean;
}
