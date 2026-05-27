import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Company } from './models/company.model';
import { Vacancy } from '@/vacancies/models/vacancy.model';
import { Application } from '@/applications/models/application.model';
import { TelegramModule } from '@/telegram/telegram.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Company, Vacancy, Application]),
    TelegramModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
