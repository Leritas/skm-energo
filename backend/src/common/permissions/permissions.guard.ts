import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Permission } from '@skm/specs';
import { Request } from 'express';
import { JwtPayloadUser } from '../auth/current-user.decorator';
import { REQUIRE_PERMISSIONS_KEY } from './require-permissions.decorator';
import { PermissionsService } from './permissions.service';

type RequestWithUser = Request & { user?: JwtPayloadUser };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Permission[] | undefined>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.userId;
    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const allowed = await this.permissionsService.userHasPermissions(
      userId,
      required,
    );
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
