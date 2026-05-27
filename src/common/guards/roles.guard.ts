import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const role = request?.user?.role;

    if (!roles.includes(role)) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
