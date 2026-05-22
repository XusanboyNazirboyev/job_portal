import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import type { Response } from 'express';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('register')
  registerPage(@Res() res: Response) {
    return res.render('auth/register');
  }

  @Post('register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    try {
      await this.service.register(body,res);
      return res.redirect('/auth/login');
    } catch (error: any) {
      return res.render('auth/register', { error: error.message });
    }
  }

  @Get('login')
  loginPage(@Res() res: Response) {
    return res.render('auth/login');
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      await this.service.login(dto, res);
      return res.redirect('/vacancies');
    } catch (error: any) {
      return res.render('auth/login', { error: error.message });
    }
  }
}
