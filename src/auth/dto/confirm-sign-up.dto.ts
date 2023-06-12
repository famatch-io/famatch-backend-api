import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ConfirmSignUpDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
