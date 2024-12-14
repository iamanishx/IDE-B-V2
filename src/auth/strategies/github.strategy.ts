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
      scope: ['user:email'], // Requesting access to user's email
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const { id, displayName, emails } = profile;
      let email = emails?.[0]?.value;

      // Fetch additional emails if not available in the profile
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

      console.log('GitHub Profile:', { id, displayName, email });

      // Ensure that GitHub's `id` is properly handled as `oauthId`
      if (!id) {
        return done(new Error('Missing oauthId in GitHub profile'), null);
      }

      // Use AuthService to find or create a user
      const { user, isNew } = await this.authService.findOrCreateUser(id, {
        name: displayName || 'GitHub User', // Fallback if displayName is missing
        email,
      });

      console.log('User Retrieved/Created:', { user, isNew });

      // Create a JWT token for the authenticated user
      const token = await this.authService.createJwt({
        oauthId: id,
        userId: user.userId,
        isNew,
      });

      console.log('Generated Token:', token);

      // Return the user and token to the Passport framework
      done(null, { token, oauthId: id, isNew });
    } catch (error) {
      console.error('Error in GitHub Strategy Validation:', error.message);
      done(error, null);
    }
  }
}
