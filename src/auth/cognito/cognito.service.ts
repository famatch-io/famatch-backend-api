// src/auth/cognito/cognito.service.ts
import {
  AuthFlowType,
  ChallengeNameType,
  CognitoIdentityProvider,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  GetUserAttributeVerificationCodeCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  RespondToAuthChallengeCommandInput,
  SignUpCommand,
  SignUpCommandInput,
  SignUpCommandOutput,
  VerifyUserAttributeCommand,
  VerifyUserAttributeCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHmac } from 'crypto';
import { ConfirmSignUpDto } from '../dto/otp.dto';
import { SignUpDto } from './../dto/signup.dto';

@Injectable()
export class CognitoService {
  private cognito: CognitoIdentityProvider;
  private cognitoClient: CognitoIdentityProviderClient;
  private region: string;
  private clientId: string;
  private clientSecret: string;
  private googleId: string;
  private googleSecret: string;
  private userPoolId: string;
  private cognitoDomainName: string;
  private readonly googleRedirUrl: string;
  constructor(private configService: ConfigService) {
    this.region = this.configService.get('AWS_COGNITO_REGION');
    this.clientId = this.configService.get('AWS_COGNITO_CLIENT_ID');
    this.clientSecret = this.configService.get('AWS_COGNITO_CLIENT_SECRET');
    this.googleId = this.configService.get('GOOGLE_CLIENT_ID');
    this.googleSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.cognitoDomainName = this.configService.get('AWS_COGNITO_DOMAIN');
    this.googleRedirUrl = `https://famatch.io`;

    this.userPoolId = this.configService.get<string>(
      'AWS_COGNITO_USER_POOL_ID',
    );

    this.cognito = new CognitoIdentityProvider({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('AWS_COGNITO_IAM_KEY'),
        secretAccessKey: this.configService.get('AWS_COGNITO_IAM_SECRET'),
      },
    });

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('AWS_COGNITO_IAM_KEY'),
        secretAccessKey: this.configService.get('AWS_COGNITO_IAM_SECRET'),
      },
    });
  }

  private createSecretHash(email: string) {
    return createHmac('sha256', this.clientSecret)
      .update(email + this.clientId)
      .digest('base64');
  }

  async initiateAuth(usernameOrEmail: string, password: string) {
    const secretHash = this.createSecretHash(usernameOrEmail);
    const params = {
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: usernameOrEmail,
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
        'userAttributes.gender': '', // The user's gender (male, female, or other)
        'userAttributes.profile': '', // A brief description of the user (max 500 characters)
        'userAttributes.picture': '', // The URL of the user's profile picture (must be an image file)
        'userAttributes.name': '', // The user's full name
        'userAttributes.phone_number': '+85212345678', // A fake phone number that cannot be called
        'userAttributes.given_name': '', // The user's first name
        'userAttributes.family_name': '', // The user's last name
      },
      Session: session,
    };

    return await this.cognito.respondToAuthChallenge(params);
  }

  async signUp(signUpDto: SignUpDto): Promise<SignUpCommandOutput> {
    const secretHash = this.createSecretHash(signUpDto.username);
    const params: SignUpCommandInput = {
      ClientId: this.clientId,
      Password: signUpDto.password,
      Username: signUpDto.username,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: 'name', Value: signUpDto.name },
        { Name: 'given_name', Value: signUpDto.given_name },
        { Name: 'family_name', Value: signUpDto.family_name },
        { Name: 'profile', Value: signUpDto.profile },
        { Name: 'picture', Value: signUpDto.picture },
        { Name: 'email', Value: signUpDto.email },
        { Name: 'gender', Value: signUpDto.gender },
        { Name: 'birthdate', Value: signUpDto.birthdate },
        { Name: 'phone_number', Value: signUpDto.phone_number },
      ],
    };

    const signUpCommand = new SignUpCommand(params);
    const signUpResponse = await this.cognito.send(signUpCommand);
    return signUpResponse;
  }

  async sendEmailVerificationCode(accessToken: string) {
    const command = new GetUserAttributeVerificationCodeCommand({
      AccessToken: accessToken,
      AttributeName: 'email',
    });
    return this.cognito.send(command);
  }

  async sendSMS(username: string) {
    // Resend the confirmation code
    const response = await this.cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: this.clientId,
        Username: username,
        SecretHash: this.createSecretHash(username),
      }),
    );
    return response;
  }

  async confirmSignUp({ username, code }: ConfirmSignUpDto) {
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      ConfirmationCode: code,
      Username: username,
      SecretHash: this.createSecretHash(username),
    });
    const confirmResponse = await this.cognito.send(command);
    return confirmResponse;
  }

  async verifyUserAttribute(input: VerifyUserAttributeCommandInput) {
    const command = new VerifyUserAttributeCommand(input);
    const confirmResponse = await this.cognito.send(command);
    return confirmResponse;
  }

  getJwksUri() {
    return `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`;
  }

  getGoogleAuthUrl() {
    const redirectUri = 'https://famatch.io';
    const scopes = ['openid', 'profile', 'email'];

    const params = {
      ClientId: this.clientId,
      RedirectUri: redirectUri,
      AuthFlow: 'USER_SRP_AUTH',
      AuthParameters: {
        auth_type: 'rerequest',
        scope: scopes.join(' '),
        identity_provider: 'Google',
        state: 'STATE_STRING',
      },
    };

    const url = 'this.cognito.url(params).authorizeURL()';
    return url;
  }

  async exchangeCodeForIdToken(code) {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';

    const params = new URLSearchParams({
      code,
      client_id: this.googleId,
      client_secret: this.googleSecret,
      redirect_uri: `https://${this.cognitoDomainName}.auth.${this.region}.amazoncognito.com/oauth2/idpresponse`,
      grant_type: 'authorization_code',
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to exchange code for ID token. Status code ${response.status}`,
      );
    }

    const { id_token } = await response.json();

    return id_token;
  }

  async authenticateWithCognito(idToken: string) {
    const authResult = await this.cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: 'CUSTOM_AUTH',
        AuthParameters: {
          'cognito:username': '',
          'cognito:custom:google:id_token': idToken,
          'cognito:userpool:id': this.userPoolId,
        },
        ClientId: this.clientId,
      }),
    );

    const { AccessToken, IdToken, RefreshToken } =
      authResult.AuthenticationResult!;
    return {
      accessToken: AccessToken!,
      idToken: IdToken!,
      refreshToken: RefreshToken!,
    };
  }

  redirectToGoogle() {
    const params = new URLSearchParams({
      client_id: this.googleId,
      redirect_uri: this.googleRedirUrl,
      response_type: 'code',
      scope: 'openid email profile',
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }

  async googleLoginCallback(code: string) {
    try {
      // Exchange the authorization code for an ID token using the Google API.
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.googleId,
        client_secret: this.googleSecret,
        redirect_uri: this.googleRedirUrl,
        grant_type: 'authorization_code',
      });

      // Authenticate the user with AWS Cognito using the Google ID token.
      const result = await this.cognito.adminInitiateAuth({
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        UserPoolId: this.userPoolId,
        AuthParameters: {
          USERNAME: data.email, // Use the email as the username.
          PASSWORD: 'google', // A password is required for ADMIN_USER_PASSWORD_AUTH.
        },
        ClientMetadata: {
          id_token: data.id_token, // Store the ID token in the client metadata.
        },
      });

      return { access_token: result.AuthenticationResult.AccessToken };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to authenticate user.');
    }
  }
}
