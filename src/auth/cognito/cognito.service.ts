// src/auth/cognito/cognito.service.ts

import {
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProvider,
  RespondToAuthChallengeCommandInput,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class CognitoService {
  private cognito: CognitoIdentityProvider;
  private region: string;
  private clientId: string;
  private clientSecret: string;
  private userPoolId: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get('AWS_COGNITO_REGION');
    this.clientId = this.configService.get('AWS_COGNITO_CLIENT_ID');
    this.clientSecret = this.configService.get('AWS_COGNITO_CLIENT_SECRET');
    this.userPoolId = this.configService.get<string>(
      'AWS_COGNITO_USER_POOL_ID',
    );

    this.cognito = new CognitoIdentityProvider({
      region: this.region,
    });
  }

  private createSecretHash(email: string) {
    return createHmac('sha256', this.clientSecret)
      .update(email + this.clientId)
      .digest('base64');
  }

  async initiateAuth(email: string, password: string) {
    const secretHash = this.createSecretHash(email);
    const params = {
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    };

    return await this.cognito.initiateAuth(params);
  }

  async respondToAuthChallenge(
    email: string,
    newPassword: string,
    session: string,
  ) {
    const secretHash = this.createSecretHash(email);
    const params: RespondToAuthChallengeCommandInput = {
      ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
      ClientId: this.clientId,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: newPassword,
        SECRET_HASH: secretHash,
        // TODO refactor this to be dynamic, and make it optional in AWS user pool
        'userAttributes.gender': 'Male', // The user's gender (male, female, or other)
        'userAttributes.profile': 'Programmer Online', // A brief description of the user (max 500 characters)
        'userAttributes.picture': 'https://example.com/picture.jpg', // The URL of the user's profile picture (must be an image file)
        'userAttributes.name': 'John Doe', // The user's full name
        'userAttributes.phone_number': '+85212345678', // A fake phone number that cannot be called
        'userAttributes.given_name': 'John', // The user's first name
        'userAttributes.family_name': 'Doe', // The user's last name
      },
      Session: session,
    };

    return await this.cognito.respondToAuthChallenge(params);
  }
  async signUp(email: string, password: string) {
    const secretHash = this.createSecretHash(email);
    const params = {
      ClientId: this.clientId,
      Username: email,
      Password: password,
      SecretHash: secretHash,
    };

    try {
      const response = await this.cognito.send(new SignUpCommand(params));
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  getJwksUri() {
    return `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;
  }
}
