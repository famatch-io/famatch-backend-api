import { IsString } from 'class-validator';

export class AuthenticateWithGoogleDto {
  @IsString()
  idToken: string;
}
