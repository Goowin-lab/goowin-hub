import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import { scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { JwtPayload } from '../common/types/authenticated-request.type';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuthSessionResponseDto,
  AuthUserDto,
  LoginResponseDto,
  LogoutResponseDto,
} from './dto/auth-session-response.dto';
import { LoginDto } from './dto/login.dto';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;

const INVALID_CREDENTIALS_MESSAGE =
  'Correo o contraseña inválidos.';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      select: {
        clientId: true,
        email: true,
        fullName: true,
        id: true,
        passwordHash: true,
        role: true,
        status: true,
      },
      where: {
        email,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE || !user.passwordHash) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordMatches = await this.verifyPassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    if (user.role === UserRole.CLIENT && !user.clientId) {
      throw new ForbiddenException(
        'El usuario cliente no está asociado a ningún cliente.',
      );
    }

    const authUser = this.toAuthUser(user);
    const payload: JwtPayload = {
      clientId: authUser.clientId,
      email: authUser.email,
      id: authUser.id,
      role: authUser.role,
      sub: authUser.id,
    };

    return {
      authenticated: true,
      redirectTo: this.getRedirectForRole(authUser.role),
      token: await this.jwtService.signAsync(payload),
      user: authUser,
    };
  }

  logout(): LogoutResponseDto {
    return {
      success: true,
    };
  }

  async me(currentUser: JwtPayload): Promise<AuthUserDto> {
    return this.getActiveAuthUser(currentUser.sub);
  }

  async session(currentUser: JwtPayload): Promise<AuthSessionResponseDto> {
    const user = await this.getActiveAuthUser(currentUser.sub);

    return {
      authenticated: true,
      redirectTo: this.getRedirectForRole(user.role),
      user,
    };
  }

  private async getActiveAuthUser(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findFirst({
      select: {
        clientId: true,
        email: true,
        fullName: true,
        id: true,
        role: true,
      },
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
      },
    });

    if (!user) {
      throw new UnauthorizedException('La sesión ya no es válida.');
    }

    return this.toAuthUser(user);
  }

  private async verifyPassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    const [algorithm, salt, key] = passwordHash.split(':');

    if (algorithm !== 'scrypt' || !salt || !key) {
      return false;
    }

    const storedKey = Buffer.from(key, 'hex');

    if (storedKey.length === 0) {
      return false;
    }

    const derivedKey = await scrypt(password, salt, storedKey.length);

    return (
      storedKey.length === derivedKey.length &&
      timingSafeEqual(storedKey, derivedKey)
    );
  }

  private toAuthUser(user: {
    clientId: string | null;
    email: string;
    fullName: string;
    id: string;
    role: UserRole;
  }): AuthUserDto {
    return {
      clientId: user.clientId,
      email: user.email,
      fullName: user.fullName,
      id: user.id,
      role: user.role,
    };
  }

  private getRedirectForRole(role: UserRole): string | null {
    switch (role) {
      case UserRole.GOOWIN_ADMIN:
      case UserRole.GOOWIN_EDITOR:
        return '/dashboard';
      case UserRole.CLIENT:
        return '/client/dashboard';
      case UserRole.AGENCY:
        return null;
    }
  }
}
