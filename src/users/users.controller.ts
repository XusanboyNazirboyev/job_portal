import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/common/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any, @Res() res: Response) {
    const user = await this.service.getMe(req.user.id);
    return res.render('users/profile', { user, showNavbar: true });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() req: any,
    @Body() dto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      await this.service.updateMe(req.user.id, dto);
      return res.redirect('/users/me');
    } catch (error: any) {
      return res.render('users/profile', {
        error: error.message,
        showNavbar: true,
      });
    }
  }
}
