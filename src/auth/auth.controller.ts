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
    const user = req.user;
    if (user) {
      if (user.role === 'admin') return res.redirect('/admin/panel');
      if (user.role === 'company') return res.redirect('/companies/panel');
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
      const msg = error.response?.message;
      return res.render('auth/login', {
        error: Array.isArray(msg) ? msg.join(', ') : msg || error.message,
      });
    }
  }

  @Get('forgot-password')
  forgotPage(@Req() req: any, @Res() res: Response) {
    return res.render('auth/forgot', {
      error: req.query.error,
      success: req.query.message,
    });
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Res() res: Response) {
    try {
      await this.service.forgotPassword(email);
      return res.redirect('/auth/forgot-password?message=Reset email sent');
    } catch (error: any) {
      return res.redirect(`/auth/forgot-password?error=${error.message}`);
    }
  }

  @Get('reset-password')
  resetPage(@Req() req: any, @Res() res: Response) {
    return res.render('auth/reset', {
      token: req.query.token,
      error: req.query.error,
    });
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    try {
      await this.service.resetPassword(token, password);
      return res.redirect('/auth/login?message=Password reset successfully');
    } catch (error: any) {
      return res.redirect(
        `/auth/reset-password?token=${token}&error=${error.message}`,
      );
    }
  }
  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.redirect('/auth/login');
  }
}
