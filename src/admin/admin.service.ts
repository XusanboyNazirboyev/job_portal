import { Application } from '@/applications/models/application.model';
import { Category } from '@/categories/models/category.model';
import { Company } from '@/companies/models/company.model';
import { User } from '@/users/models/user.model';
import { Vacancy } from '@/vacancies/models/vacancy.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt'
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Company) private readonly companyModel: typeof Company,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
    @InjectModel(Application)
    private readonly applicationModel: typeof Application,
  ) {}

  async seedAdmin() {
    const existing = await this.userModel.findOne({
      where: { email: 'admin@gmail.com' },
    });
    if (!existing) {
      const password = await bcrypt.hash('12345', 10);
      await this.userModel.create({
        full_name: 'Admin',
        email: 'admin@gmail.com',
        password,
        role: 'admin',
        is_active: true,
      });
      console.log('Admin created✅');
    }
  }
  async getUsers() {
    return this.userModel.findAll({ attributes: { exclude: ['password'] } });
  }

  async deleteUser(id: string) {
    const existing = await this.userModel.findByPk(id);
    if (!existing) throw new NotFoundException('User not found');

    // user ning company si bo'lsa avval uni o'chir
    const company = await this.companyModel.findOne({
      where: { owner_id: id },
    });
    if (company) {
      const vacancies = await this.vacancyModel.findAll({
        where: { company_id: company.id },
      });
      for (const vacancy of vacancies) {
        await this.applicationModel.destroy({
          where: { vacancy_id: vacancy.id },
        });
      }
      await this.vacancyModel.destroy({ where: { company_id: company.id } });
      await company.destroy();
    }
    await this.applicationModel.destroy({ where: { user_id: id } });

    await existing.destroy();
    return { success: true };
  }
  async getCompanies() {
    return this.companyModel.findAll();
  }

  async deleteCompany(id: string) {
    const existing = await this.companyModel.findByPk(id);

    if (!existing) {
      throw new NotFoundException('Company not found');
    }

    const vacancies = await this.vacancyModel.findAll({
      where: { company_id: id },
    });
    for (const vacancy of vacancies) {
      await this.applicationModel.destroy({
        where: { vacancy_id: vacancy.id },
      });
    }
    await this.vacancyModel.destroy({ where: { company_id: id } });

    await existing.destroy();
    return { success: true };
  }

  async getCategories() {
    return this.categoryModel.findAll();
  }

  async createCategory(name: string) {
    return this.categoryModel.create({ name });
  }

  async deleteCategory(id: string) {
    const existing = await this.categoryModel.findByPk(id);
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const vacancies = await this.vacancyModel.findAll({
      where: { category_id: id },
    });
    for (const vacancy of vacancies) {
      await this.applicationModel.destroy({
        where: { vacancy_id: vacancy.id },
      });
    }
    await this.vacancyModel.destroy({ where: { category_id: id } });

    await existing.destroy();
    return { success: true };
  }
}
