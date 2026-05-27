import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import type { Response } from 'express';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('register')
  registerPage(@Req() req: any, @Res() res: Response) {
    return res.render('auth/register', {
      error: req.query.error,
    });
  }

  @Post('register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    try {
      await this.service.register(body, res);
      return res.redirect('/auth/login');
    } catch (error: any) {
      return res.render('auth/register', { error: error.message });
    }
  }

  @Get('login')
  loginPage(@Req() req: any, @Res() res: Response) {
    const token = req.cookies?.['accessToken'];
    if (token) {
      const role = req.user?.role;
      if (role === 'admin') return res.redirect('/admin/panel');
      if (role === 'company') return res.redirect('/companies/panel');
      return res.redirect('/vacancies');
    }
    return res.render('auth/login', { error: req.query.error });
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      const role = await this.service.login(dto, res);
      console.log('role:', role);
      if (role === 'company') return res.redirect('/companies/panel');
      if (role === 'admin') return res.redirect('/admin/panel');
      return res.redirect('/vacancies');
    } catch (error: any) {
      return res.render('auth/login', {
        error: error.response?.message?.[0] || error.message,
      });
    }
  }
  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.redirect('/auth/login');
  }
}
