import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@/users/models/user.model';
import { Vacancy } from '@/vacancies/models/vacancy.model';
import { Application } from '@/applications/models/application.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Vacancy, Application])],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
