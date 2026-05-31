import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './models/company.model';
import { Vacancy } from '@/vacancies/models/vacancy.model';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { Application } from '@/applications/models/application.model';
import { User } from '@/users/models/user.model';
import { Category } from '@/categories/models/category.model';
import { TelegramService } from '@/telegram/telegram.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company) private readonly model: typeof Company,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
    @InjectModel(Application)
    private readonly applicationModel: typeof Application,
    private readonly telegramService:TelegramService
  ) {}

  async getPanel(userId: string) {
    const company = await this.model.findOne({
      where: { owner_id: userId },
      include: [Vacancy],
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async create(userId: string, body: CreateVacancyDto) {
    const company = await this.model.findOne({ where: { owner_id: userId } });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const vacancy = await this.vacancyModel.create({ ...body, company_id: company.id });

    const telegramService = this.telegramService as any;
    if (typeof telegramService.sendNewVacancyNotification === 'function') {
      await telegramService.sendNewVacancyNotification(vacancy.toJSON());
    }
    return vacancy;
  }

  async getVacancy(userId: string, vacancyId: string) {
    const company = await this.model.findOne({ where: { owner_id: userId } });
    if (!company) throw new NotFoundException('Company not found');

    const vacancy = await this.vacancyModel.findOne({
      where: { id: vacancyId, company_id: company.id },
    });
    if (!vacancy) throw new NotFoundException('Vacancy not found');

    return vacancy.toJSON();
  }

  async update(userId: string, vacancyId: string, body: UpdateVacancyDto) {
    const company = await this.model.findOne({ where: { owner_id: userId } });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const vacancy = await this.vacancyModel.findOne({
      where: { id: vacancyId, company_id: company.id },
    });
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }
    await vacancy.update(body);
    return vacancy;
  }

  async delete(userId: string, vacancyId: string) {
    const company = await this.model.findOne({ where: { owner_id: userId } });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const vacancy = await this.vacancyModel.findOne({
      where: { id: vacancyId, company_id: company.id },
    });
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }
    await vacancy.destroy();
    return { success: true };
  }

  async getApplications(userId: string, vacancyId: string) {
    const company = await this.model.findOne({ where: { owner_id: userId } });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const vacancy = await this.vacancyModel.findOne({
      where: { id: vacancyId, company_id: company.id },
    });
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }

    return this.applicationModel.findAll({
      where: { vacancy_id: vacancyId },
      include: [User],
    });
  }
  async getCategories() {
    return Category.findAll();
  }
}
