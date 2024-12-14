import { Controller, Get, Post, Req, Res, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    try {
      const { token, oauthId } = req.user;

      // Verify the token
      this.jwtService.verify(token);

      // Decode the token and extract oauthId
      const decoded = this.jwtService.decode(token);
      const extractedOauthId = oauthId || decoded?.oauthId;

      if (!extractedOauthId) {
        throw new Error('oauthId is missing from the token or request');
      }

      // Find the user by oauthId or create a new one if it doesn't exist
      let user = await User.findOne({ where: { oauthId: extractedOauthId } });
      if (!user) {
        user = await User.create({ oauthId: extractedOauthId }); // Create placeholder user
      }

      // Redirect based on whether userId exists
      if (user.userId) {
        // If userId is already set, redirect to home
        return res.redirect(`http://localhost:5173/home?token=${token}`);
      }

      // If userId is not set, redirect to set userId page
      return res.redirect(`http://localhost:5173/userid?token=${token}`);
    } catch (error) {
      console.error('Error in Google Callback:', error.message, error.stack);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res) {
    try {
      const { token } = req.user;

      // Verify the token
      const decoded = this.jwtService.verify(token);
      const extractedOauthId = decoded?.oauthId;

      if (!extractedOauthId) {
        throw new Error('oauthId is missing from the token');
      }

      // Find the user by oauthId or create a new one if it doesn't exist
      let user = await User.findOne({ where: { oauthId: extractedOauthId } });
      if (!user) {
        user = await User.create({ oauthId: extractedOauthId }); // Create placeholder user
      }

      // Redirect based on whether userId exists
      if (user.userId) {
        // If userId is already set, redirect to home
        return res.redirect(`http://localhost:5173/home?token=${token}`);
      }

      // If userId is not set, redirect to set userId page
      return res.redirect(`http://localhost:5173/userid?token=${token}`);
    } catch (error) {
      console.error('Error in GitHub Callback:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('userid')
  @UseGuards(AuthGuard('jwt'))
  async updateUserId(@Req() req, @Body('userId') userId: string, @Res() res) {
    console.log('Received userId:', userId);
    try {
      const { oauthId } = req.user;

      // Validate userId
      if (!userId || typeof userId !== 'string' || !userId.trim()) {
        return res.status(400).json({ message: 'Valid userId is required' });
      }

      // Find the user by oauthId
      const user = await User.findOne({ where: { oauthId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if userId is already taken
      const existingUser = await User.findOne({ where: { userId } });
      if (existingUser) {
        return res.status(409).json({ message: 'userId already exists' });
      }

      // Update user with new userId
      user.userId = userId.trim();
        await user.save();



      // Generate a new token with updated information
      const token = this.authService.createJwt({
        oauthId: user.oauthId,
        userId: user.userId,
        isNew: false,
      });

      // Redirect to home page
      res.redirect(`http://localhost:5173/home?token=${token}`);
    } catch (error) {
      console.error('Error in Update UserId:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('home')
  @UseGuards(AuthGuard('jwt'))
  async home(@Req() req) {
    return { message: 'Welcome to your home page!', user: req.user };
  }
}
