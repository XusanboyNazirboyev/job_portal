import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {}

  async getMe(id: string) {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) throw new NotFoundException('User not found');
    return user.toJSON();
  }

  async updateMe(id: string, dto: UpdateUserDto) {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    user.setDataValue(
      'full_name',
      dto.full_name ?? user.getDataValue('full_name'),
    );
    user.setDataValue(
      'telegram_id',
      dto.telegram_id ?? user.getDataValue('telegram_id'),
    );
    await user.save();
    const { password, ...result } = user.toJSON();
    return result;
  }
}
