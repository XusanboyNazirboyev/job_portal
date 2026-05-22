import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vacancy } from './models/vacancy.model';
import { Category } from '../categories/models/category.model';
import { Company } from '../companies/models/company.model';

@Injectable()
export class VacanciesService {
  constructor(@InjectModel(Vacancy) private vacancyModel: typeof Vacancy) {}

  async getAll() {
    const vacancies = await this.vacancyModel.findAll({
      include: [Category, Company],
    });
    return vacancies.map((v) => v.toJSON());
  }

  async getOne(id: string) {
    const vacancy = await this.vacancyModel.findByPk(id, {
      include: [Category, Company],
    });
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }
    return vacancy.toJSON();
  }
}
