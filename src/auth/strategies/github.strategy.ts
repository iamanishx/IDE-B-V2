import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-github';
import { AuthService } from '../auth.service';
import fetch from 'node-fetch';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],  
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const { id, displayName, emails } = profile;

      console.log('GitHub Profile:', { id, displayName, emails });

       if (!id) {
        return done(new Error('Missing oauthId in GitHub profile'), null);
      }

      let email = emails?.[0]?.value;

      // Fetch additional emails if the primary email is unavailable
      if (!email) {
        const response = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch emails from GitHub');
        }

        const emailData = (await response.json()) as { email: string; primary: boolean }[];
        email = emailData.find((e) => e.primary)?.email || emailData[0]?.email;

        if (!email) {
          throw new Error('Unable to retrieve email from GitHub');
        }
      }

      // Use AuthService to find or create the user
      const { user, isNew } = await this.authService.findOrCreateUser(id, {
        name: displayName || 'GitHub User', // Fallback if displayName is missing
        email,
      });

      console.log('User Retrieved/Created:', {
        user: user.dataValues, // Explicitly log the dataValues
        isNew,
      });

      // Extract the userId explicitly
      const userId = user.dataValues.userId;

      // Generate a JWT token for the authenticated user
      const token = await this.authService.createJwt({
        oauthId: id,
        userId: userId, 
        isNew: !userId,  
      });

      console.log('Generated Token Payload:', {
        oauthId: id,
        userId: userId,
        isNew: !userId,
      });
      console.log('Generated Token:', token);

      // Return the user and token to Passport
      done(null, {
        token,
        oauthId: id,
        isNew: !userId,
      });
    } catch (error) {
      console.error('Error in GitHub Strategy Validation:', error.message);
      done(error, null);
    }
  }
}
