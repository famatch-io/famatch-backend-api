import { IsNotEmpty, IsString, Length } from 'class-validator';
import { CodeField } from './otp-code.mixin';

export class ConfirmSignUpDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}

export class ConfirmOTPDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @CodeField()
  code: string;
}

export class CodeDto {
  @CodeField()
  code: string;
}
