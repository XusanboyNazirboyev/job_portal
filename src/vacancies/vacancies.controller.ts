import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { VacanciesService } from './vacancies.service';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly service: VacanciesService) {}

  @Get()
  async index(@Res() res: Response) {
    const vacancies = await this.service.getAll();
    return res.render('vacancies/index', { vacancies });
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: string, @Res() res: Response) {
    try {
      const vacancy = await this.service.getOne(id);
      return res.render('vacancies/detail', { vacancy });
    } catch (error: any) {
      return res.redirect('/vacancies');
    }
  }
}
