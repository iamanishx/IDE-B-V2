import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { id, displayName, emails } = profile;
  
    console.log('Google Profile:', { id, displayName, emails });
  
    if (!id) {
      return done(new Error('Missing oauthId in Google profile'), null);
    }
  
    if (!emails || emails.length === 0) {
      return done(new Error('Email is missing in Google profile'), null);
    }
  
    const { user, isNew } = await this.authService.findOrCreateUser(id, {
      name: displayName,
      email: emails[0]?.value,
    });
  
    console.log('User Retrieved/Created:', { 
      user: user.dataValues,   
      isNew 
    });
  
     const userId = user.dataValues.userId;
  
    const token = await this.authService.createJwt({
      oauthId: id,
      userId: userId, // Use the explicit userId from dataValues
      isNew: !userId // Set isNew based on userId existence
    });
  
    console.log('Generated Token Payload:', {
      oauthId: id,
      userId: userId,
      isNew: !userId
    });
    console.log('Generated Token:', token);
  
    done(null, {
      token,
      oauthId: id,
      isNew: !userId
    });
  } }