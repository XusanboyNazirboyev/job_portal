import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { VacanciesService } from './vacancies.service';

@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly service: VacanciesService) {}

  @Get()
  async index(@Query() query: any, @Res() res: Response) {
    // URL'dan kelayotgan barcha filtrlarni servisga berib yuboramiz
    const vacancies = await this.service.getAll(query);

    // filters: query orqali front-end'dagi inputlarni holatini saqlab qolamiz
    return res.render('vacancies/index', {
      vacancies,
      showNavbar: true,
      filters: query,
    });
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const vacancy = await this.service.getOne(String(id));
    return res.render('vacancies/detail', { vacancy, showNavbar: true });
  }
}
