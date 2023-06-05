// src/auth/auth.service.ts

import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoService } from './cognito/cognito.service';

@Injectable()
export class AuthService {
  constructor(private cognitoService: CognitoService) {}

  async login(email: string, password: string) {
    try {
      const { ChallengeName, AuthenticationResult, Session } =
        await this.cognitoService.initiateAuth(email, password);

      // * user first time login will require reset password
      if (ChallengeName === ChallengeNameType.NEW_PASSWORD_REQUIRED) {
        return {
          challengeName: ChallengeName,
          session: Session,
        };
      }

      if (!AuthenticationResult)
        throw new Error('Error, failed to get AuthenticationResult');

      return {
        accessToken: AuthenticationResult.AccessToken,
        idToken: AuthenticationResult.IdToken,
        refreshToken: AuthenticationResult.RefreshToken,
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async respondToAuthChallenge(
    email: string,
    newPassword: string,
    session: string,
  ) {
    try {
      const response = await this.cognitoService.respondToAuthChallenge(
        email,
        newPassword,
        session,
      );
      const { AuthenticationResult } = response;
      return {
        accessToken: AuthenticationResult?.AccessToken,
        idToken: AuthenticationResult?.IdToken,
        refreshToken: AuthenticationResult?.RefreshToken,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Invalid data');
    }
  }
}
