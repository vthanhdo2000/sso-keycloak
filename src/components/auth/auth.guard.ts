import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] as string | undefined;
    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      const decoded = jwt.verify(token, process.env.KEYCLOAK_CLIENT_SECRET, {
        algorithms: ['RS256'],
      }) as jwt.JwtPayload;

      console.log(decoded);
      request.user = decoded;

      if (requiredRoles && requiredRoles.length > 0) {
        const userRoles = decoded['realm_access']?.roles || [];
        const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

        if (!hasRequiredRole) {
          throw new ForbiddenException('Forbidden: insufficient permissions');
        }
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', error);
    }
  }
}
