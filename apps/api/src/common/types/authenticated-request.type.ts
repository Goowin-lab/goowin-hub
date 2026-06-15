import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  clientId?: string | null;
}

export interface AuthenticatedRequest {
  headers: {
    authorization?: string | string[];
  };
  user?: JwtPayload;
}
