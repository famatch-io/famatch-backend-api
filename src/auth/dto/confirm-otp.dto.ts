import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ConfirmOTPDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
