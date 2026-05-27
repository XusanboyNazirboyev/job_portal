import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { VacanciesService } from './vacancies.service';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly service: VacanciesService) {}

  @Get()
  async index(@Res() res: Response) {
    const vacancies = await this.service.getAll();
    return res.render('vacancies/index', { vacancies, showNavbar: true });
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const vacancy = await this.service.getOne(String(id));
    return res.render('vacancies/detail', { vacancy, showNavbar: true });
  }
}
