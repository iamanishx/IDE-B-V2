// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ||'mySuperSecureRandomString123!@#',
    });
  }

  async validate(payload: any) {
    // Attach the decoded payload to the request user object
    return { userId: payload.userId, oauthId: payload.oauthId, isNew: payload.isNew };
  }
}
