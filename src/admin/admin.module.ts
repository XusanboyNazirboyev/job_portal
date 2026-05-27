import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@/users/models/user.model';
import { Company } from '@/companies/models/company.model';
import { Category } from '@/categories/models/category.model';
import { Vacancy } from '@/vacancies/models/vacancy.model';
import { Application } from '@/applications/models/application.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Company, Category, Vacancy, Application]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
