import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../../database/prisma.service';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true, // Needed to access the raw token for DB validation
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    // Extract raw token to check if it's still active in DB (supports logout - EIE-003)
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const session = await this.prisma.sessionToken.findUnique({
      where: { token: token ?? '' },
      select: { isActive: true, expiresAt: true },
    });

    // EIE-016: reject if token was invalidated via logout or doesn't exist
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Token inválido o sesión cerrada');
    }

    // The returned object is attached to request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
