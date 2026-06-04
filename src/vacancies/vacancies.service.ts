import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize'; // Operatorlarni import qilamiz
import { Vacancy } from './models/vacancy.model';
import { Category } from '../categories/models/category.model';
import { Company } from '../companies/models/company.model';

@Injectable()
export class VacanciesService {
  constructor(@InjectModel(Vacancy) private vacancyModel: typeof Vacancy) {}

  async getAll(query: any) {
    const { search, location, type, sort } = query;

    const whereClause: any = {};

    if (search && search.trim() !== '') {
      whereClause.title = { [Op.iLike]: `%${search}%` };
    }

    if (location && location.trim() !== '') {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }

    if (type) {
      whereClause.type = type;
    }

    let orderClause: any = [['createdAt', 'DESC']]; 

    if (sort === 'salary') {
      orderClause = [['salary', 'DESC']]; 
    } else if (sort === 'recent') {
      orderClause = [['createdAt', 'DESC']]; 
    }

    const vacancies = await this.vacancyModel.findAll({
      where: whereClause,
      order: orderClause,
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
