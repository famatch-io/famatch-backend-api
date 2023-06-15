// src/auth/google.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET',
      callbackURL: 'YOUR_CALLBACK_URL',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // This function will be called when the user is authenticated successfully.
    // You can use the information in the `profile` object to create or update a user in your database.
    // The `accessToken` and `refreshToken` can be used to make API requests on behalf of the user.

    const user = await this.authService.findOrCreateUserFromGoogleProfile(
      profile,
    );
    done(null, user);
  }
}
