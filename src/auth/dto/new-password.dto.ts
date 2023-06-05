import { IsNotEmpty, IsString } from 'class-validator';

export class NewPasswordDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  session: string;
}
