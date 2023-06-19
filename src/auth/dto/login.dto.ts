import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'username or email' })
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
