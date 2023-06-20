// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
  async googleLogin(@Req() req: Request, @Res() res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = `${req.protocol}://${req.get(
      'host',
    )}/auth/google/callback`;

    const queryParams = querystring.stringify({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryParams}`;

    res.redirect(authUrl);
  }
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = `${req.protocol}://${req.get(
      'host',
    )}/auth/google/callback`;
    const code = req.query.code;

    // Exchange authorization code for access token and id token
    const tokenResponse = await request.post({
      url: 'https://oauth2.googleapis.com/token',
      form: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      json: true,
    });

    // Verify id token
    const idToken = tokenResponse.id_token;
    const publicKeyResponse = await request.get(
      'https://www.googleapis.com/oauth2/v3/certs',
      { json: true },
    );
    const publicKeySet = publicKeyResponse.keys;
    let verifiedIdToken;

    try {
      verifiedIdToken = jwt.verify(idToken, getPublicKey(publicKeySet));
    } catch (err) {
      console.error(err);
      return res.status(401).send();
    }

    // Authenticate user in your application using verifiedIdToken.sub
    // ...
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
