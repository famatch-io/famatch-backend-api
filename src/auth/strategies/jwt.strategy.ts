// Import necessary modules and services:

// Injectable, PassportStrategy from NestJS for creating a custom strategy.
// jwt for decoding JWT tokens.
// jwksRsa for fetching the JSON Web Key Set (JWKS) from Cognito.
// ExtractJwt, Strategy from passport-jwt for handling JWT authentication.
// CognitoService for interacting with AWS Cognito.
// AWSCognitoPayload for defining the JWT payload structure.
// Create the JwtStrategy class that extends the PassportStrategy:

// The class is decorated with @Injectable() to make it a NestJS provider.
// The constructor takes a CognitoService instance as a dependency.
// The super() call initializes the Passport JWT strategy with the following options:
// jwtFromRequest: A function to extract the JWT token from the request's Authorization header.
// ignoreExpiration: Set to false to ensure expired tokens are rejected.
// secretOrKeyProvider: A custom function to fetch the public key from Cognito's JWKS to verify the JWT signature.
// Implement the onModuleInit() method:

// This method is called when the NestJS module is initialized.
// It fetches the JWKS URI from the CognitoService and initializes the jwksClient with the jwksRsa library.
// Implement the fetchCognitoJwks() method:

// This method is the custom secretOrKeyProvider function.
// It decodes the JWT token without verifying the signature to extract the header.
// If the header is missing or invalid, it returns an error.
// It fetches the JSON Web Key (JWK) from the JWKS using the key ID (kid) from the JWT header.
// It calls the done callback with the public key from the JWK, which is used to verify the JWT signature.
// Implement the validate() method:

// This method is called after the JWT token is successfully verified.
// It receives the decoded JWT payload as a parameter.
// In this case, it simply returns the payload, but you can add custom validation or transformation logic if needed.
// The JwtStrategy class can be used with NestJS's AuthGuard to protect routes that require JWT authentication. When a request is made to a protected route, the strategy will validate the JWT token and, if valid, allow access to the route.

// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CognitoService } from '../cognito/cognito.service';
import { AWSCognitoPayload } from '../models/AwsCognitoPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private jwksClient;

  constructor(private readonly cognitoService: CognitoService) {
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
    return payload;
  }
}
