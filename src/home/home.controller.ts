import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class HomeController {
  @Get('/')
  home(@Res() res: Response) {
    return res.render('home', {
      showNavbar: false,
      isHome: true,
    });
  }
}
