import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Application } from './models/application.model';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { Vacancy } from '@/vacancies/models/vacancy.model';
import { User } from '@/users/models/user.model';
import { UpdateStatusDto } from './dtos/update-status.dto';
import { TelegramService } from '@/telegram/telegram.service';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application) private readonly model: typeof Application,
    private readonly telegramService: TelegramService,
    private readonly mailService: MailService,
  ) {}

  async getAll(id: string) {
    return this.model.findAll({ where: { user_id: id }, include: [Vacancy] });
  }

  async create(body: CreateApplicationDto, userId: string, resumePath: string) {
    const existing = await this.model.findOne({
      where: { user_id: userId, vacancy_id: body.vacancy_id },
    });

    if (existing) {
      throw new BadRequestException('Already applied');
    }
    return this.model.create({
      user_id: userId,
      vacancy_id: body.vacancy_id,
      resume: resumePath,
    });
  }

  async findByVacancy(id: string) {
    return this.model.findAll({
      where: { vacancy_id: id },
      include: [User, Vacancy],
    });
  }

  async updateStatus(id: string, body: UpdateStatusDto) {
    const application = await this.model.findByPk(id, {
      include: [User, Vacancy],
    });
    if (!application) throw new NotFoundException('Application not found');

    application.setDataValue('status', body.status);
    await application.save();

    const user = application.get('user') as User;
    const vacancy = application.get('vacancy') as Vacancy;

    await this.telegramService.sendStatusNotification(
      application.user?.telegram_id,
      body.status,
      application.vacancy?.title,
    );
    await this.mailService.sendStatusUpdate(
      user?.getDataValue('email'),
      user?.getDataValue('full_name'),
      body.status,
      vacancy?.getDataValue('title'),
    );
    return application;
  }
}
