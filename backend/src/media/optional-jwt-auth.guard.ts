import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { JwtPayloadUser } from '../common/auth/current-user.decorator';

export type RequestWithOptionalUser = Request & {
  user?: JwtPayloadUser;
};

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithOptionalUser>();
    const authorization = request.headers?.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = JwtPayloadUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser | undefined {
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
