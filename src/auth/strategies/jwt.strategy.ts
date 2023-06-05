// src/auth/strategies/jwt.strategy.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { CognitoService } from '../cognito/cognito.service';
import { AWSCognitoPayload } from '../models/AwsCognitoPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private jwksClient;

  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        await this.fetchCognitoJwks(request, rawJwtToken, done);
      },
    });
  }

  async onModuleInit() {
    const jwksUri = await this.cognitoService.getJwksUri();
    this.jwksClient = jwksRsa({
      cache: true,
      jwksUri,
    });
  }

  async fetchCognitoJwks(request, rawJwtToken, done) {
    try {
      const decoded = jwt.decode(rawJwtToken, { complete: true });

      if (!decoded || !decoded.header) {
        return done(new Error('Invalid JWT token'));
      }

      const jwk = await this.jwksClient.getSigningKey(decoded.header.kid);
      done(null, jwk.getPublicKey());
    } catch (error) {
      done(error);
    }
  }

  async validate(payload: AWSCognitoPayload) {
    const user = await this.userService.getUserByCognitoId(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found in app');
    }
    return user;
  }
}
