import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isGetRequest = request.method === 'GET';

    if (!isGetRequest) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = request.user?.id || 'anonymous';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const sessionId = request.headers['x-session-id'] || 'no-session';

    // Create a unique cache key per URL + User + Session
    // We use originalUrl to ensure the global prefix (/api/v1) is included consistently
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const key = `${request.originalUrl}-${userId}-${sessionId}`;
    console.log(`[UserCacheInterceptor] Cache key generated: ${key}`);
    return key;
  }
}
