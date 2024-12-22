import { Controller, Get, Post, Req, Res, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from './schema/user.entity';
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
    const { token, oauthId, isNew } = req.user;

    // Verify and decode the token
    this.jwtService.verify(token);
    const decoded = this.jwtService.decode(token);

    console.log('Decoded Token:', decoded);
    console.log('Is New User:', isNew);

    // Explicitly check for userId existence
    const hasUserId = decoded.userId && decoded.userId.trim() !== '';

    // If no userId or isNew is true, redirect to /userid
    if (!hasUserId || isNew) {
      console.log("Redirecting to /userid: hasUserId =", hasUserId, "isNew =", isNew);
      return res.redirect(`http://localhost:5173/userid?token=${token}`);
    }

    // For existing users with userId, redirect to home
    console.log("Redirecting to /home for existing user");
    return res.redirect(`http://localhost:5173/home?token=${token}`);

  } catch (error) {
    console.error('Error in Google Callback:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

@Get('github')
@UseGuards(AuthGuard('github'))
async githubAuth() {
  // Initiates GitHub OAuth flow
}
@Get('github/callback')
@UseGuards(AuthGuard('github'))
async githubCallback(@Req() req, @Res() res) {
  try {
    const { token, oauthId, isNew } = req.user;

    // Verify and decode the token
    this.jwtService.verify(token);
    const decoded = this.jwtService.decode(token);

    console.log('Decoded Token:', decoded);
    console.log('Is New User:', isNew);

    // Explicitly check for userId existence
    const hasUserId = decoded['userId'] && decoded['userId'].trim() !== '';

    // If no userId or isNew is true, redirect to /userid
    if (!hasUserId || isNew) {
      console.log("Redirecting to /userid: hasUserId =", hasUserId, "isNew =", isNew);
      return res.redirect(`http://localhost:5173/userid?token=${token}`);
    }

    // For existing users with userId, redirect to home
    console.log("Redirecting to /home for existing user");
    return res.redirect(`http://localhost:5173/home?token=${token}`);
  } catch (error) {
    console.error('Error in GitHub Callback:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


  @Post('userid')
@UseGuards(AuthGuard('jwt'))
async updateUserId(@Req() req, @Body('userId') newUserId: string, @Res() res) {
  console.log('Received userId:', newUserId);
  try {
    const { oauthId } = req.user;

    // Validate userId
    if (!newUserId || typeof newUserId !== 'string' || !newUserId.trim()) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }

    // Find the user by oauthId
    const user = await User.findOne({ where: { oauthId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if userId is already taken
    const existingUser = await User.findOne({ where: { userId: newUserId } });
    if (existingUser) {
      return res.status(409).json({ message: 'userId already exists' });
    }

    // Update user with new userId
    user.userId = newUserId.trim();
     // Mark as changed
    await User.update(
      { userId: newUserId.trim() },
      { where: { oauthId } }
    );
    

    console.log('Updated user:', user);

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
