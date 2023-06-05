// src/auth/auth.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { NewPasswordDto } from './dto/new-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('respond-to-new-password-required')
  respondToNewPasswordRequired(@Body() newPasswordDto: NewPasswordDto) {
    return this.authService.respondToAuthChallenge(
      newPasswordDto.email,
      newPasswordDto.newPassword,
      newPasswordDto.session,
    );
  }
}
