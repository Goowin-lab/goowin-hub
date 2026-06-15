import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import {
  AuthenticatedRequest,
  JwtPayload,
} from '../types/authenticated-request.type';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
