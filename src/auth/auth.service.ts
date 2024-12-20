// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async findOrCreateUser(oauthId: string, defaults: Partial<User>): Promise<{ user: User; isNew: boolean }> {
    const [user, created] = await this.userModel.findOrCreate({
      where: { oauthId: oauthId  },
      defaults,
    });
    return { user, isNew: created };
  }

 // In auth.service.ts
async createJwt(payload: { oauthId: string, userId?: string, isNew?: boolean }) {
  return this.jwtService.sign(payload);
}

}