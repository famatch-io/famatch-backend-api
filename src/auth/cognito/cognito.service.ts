// src/auth/cognito/cognito.service.ts

import {
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProvider,
  RespondToAuthChallengeCommandInput,
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
        'userAttributes.gender': 'male', // The gender attribute and its value
        'userAttributes.profile': 'male', // The gender attribute and its value
        'userAttributes.picture': 'male', // The gender attribute and its value
        'userAttributes.name': 'male', // The gender attribute and its value
        'userAttributes.phone_number': '+85264443303', // The gender attribute and its value
        'userAttributes.given_name': 'male', // The gender attribute and its value
        'userAttributes.family_name': 'male', // The gender attribute and its value
      },
      Session: session,
    };

    return await this.cognito.respondToAuthChallenge(params);
  }

  getJwksUri() {
    return `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;
  }
}
