import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Application } from './models/application.model';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { TelegramModule } from '@/telegram/telegram.module';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Application]),
    TelegramModule,
    MailModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
