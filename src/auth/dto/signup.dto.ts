import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('HK')
  phone_number: string;

  @IsOptional()
  @IsString()
  name?: string = '';

  @IsOptional()
  @IsString()
  given_name?: string = '';

  @IsOptional()
  family_name?: string = '';

  @IsOptional()
  @IsString()
  profile?: string = '';

  @IsOptional()
  @IsString()
  picture?: string = '';

  @IsOptional()
  @IsString()
  gender?: string = '';

  @IsOptional()
  birthdate?: string = '';
}
