import { IsString } from 'class-validator';

export class AuthenticateWithGoogleDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly code: string;

  @IsString()
  readonly redirectUri: string;
}
