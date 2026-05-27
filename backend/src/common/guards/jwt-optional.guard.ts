import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT guard: if a valid token is present, it attaches the user
 * to the request. If no token is provided, the request proceeds
 * without a user (anonymous access for cart operations).
 */
@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Don't throw on missing/invalid token — just return null
    if (err || !user) {
      return null;
    }
    return user;
  }
}
