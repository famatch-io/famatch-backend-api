// src/auth/auth.service.ts

import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoService } from './cognito/cognito.service';
import { SignUpDto } from './dto/signup.dto';
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

  async signUp(signUpDto: SignUpDto) {
    try {
      const response = await this.cognitoService.signUp(signUpDto);
      return {
        message: 'User signed up successfully.',
        userSub: response.UserSub,
      };
    } catch (error) {
      console.error(error);
      // Customize error handling as needed
      throw new BadRequestException('Unable to sign up.');
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
      if (!AuthenticationResult)
        throw new Error('Error, failed to get AuthenticationResult');

      return {
        accessToken: AuthenticationResult.AccessToken,
        idToken: AuthenticationResult.IdToken,
        refreshToken: AuthenticationResult.RefreshToken,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Invalid data');
    }
  }
}
