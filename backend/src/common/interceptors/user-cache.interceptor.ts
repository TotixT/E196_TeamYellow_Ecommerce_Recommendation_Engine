import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const isGetRequest = request.method === 'GET';
    
    if (!isGetRequest) {
      return undefined;
    }

    const userId = request.user?.id || 'anonymous';
    const sessionId = request.headers['x-session-id'] || 'no-session';
    
    // Create a unique cache key per URL + User + Session
    // We use originalUrl to ensure the global prefix (/api/v1) is included consistently
    const key = `${request.originalUrl}-${userId}-${sessionId}`;
    console.log(`[UserCacheInterceptor] Cache key generated: ${key}`);
    return key;
  }
}
