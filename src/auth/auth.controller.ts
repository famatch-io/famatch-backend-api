// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { CodeDto, ConfirmSignUpDto } from './dto/otp.dto';
import { SignUpDto } from './dto/signup.dto';
import { GetAccessToken } from './get-jwt.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @Redirect('https://accounts.google.com/o/oauth2/v2/auth', 302)
  async redirectToGoogle() {
    return this.authService.redirectToGoogle();
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Query('code') code: string) {
    return this.authService.googleLoginCallback(code);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.usernameOrEmail, loginDto.password);
  }

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('send-sms')
  async sendSMS(@Body('username') username: string) {
    return this.authService.sendSMS(username);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-verification-email')
  async sendEmailVerificationCode(@GetAccessToken() accessToken: string) {
    return this.authService.sendEmailVerificationCode(accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-email')
  async confirmEmail(
    @GetAccessToken() accessToken: string,
    @Body() { code }: CodeDto,
  ) {
    return this.authService.confirmEmail(accessToken, code);
  }

  @Post('confirm-sms-signup')
  async confirmSmsSignUp(@Body() confirmSignUpDto: ConfirmSignUpDto) {
    return this.authService.confirmSmsSignUp(confirmSignUpDto);
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
