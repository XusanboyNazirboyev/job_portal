import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vacancy } from './models/vacancy.model';
import { VacanciesController } from './vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { Company } from '@/companies/models/company.model';
import { Category } from '@/categories/models/category.model';

@Module({
  imports: [SequelizeModule.forFeature([Vacancy, Company, Category])],
  controllers: [VacanciesController],
  providers: [VacanciesService],
})
export class VacanciesModule {}
