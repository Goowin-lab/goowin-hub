import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  AuthenticatedRequest,
  JwtPayload,
} from '../types/authenticated-request.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired bearer token.');
    }
  }

  private extractTokenFromHeader(
    authorization: string | string[] | undefined,
  ): string | undefined {
    const headerValue = Array.isArray(authorization)
      ? authorization[0]
      : authorization;

    if (!headerValue) {
      return undefined;
    }

    const [type, token] = headerValue.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
