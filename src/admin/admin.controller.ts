import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('panel')
  async panel(@Res() res: Response) {
    return res.render('admin/panel', { showNavbar: true });
  }

  @Get('users')
  async getUsers(@Res() res: Response) {
    const users = await this.service.getUsers();
    return res.render('admin/users', {
      users: users.map((u) => u.toJSON()),
      showNavbar: true,
    });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    await this.service.deleteUser(id);
    return res.redirect('/admin/users');
  }

  @Get('companies')
  async getCompanies(@Res() res: Response) {
    const companies = await this.service.getCompanies();
    return res.render('admin/companies', {
      companies: companies.map((c) => c.toJSON()),
      showNavbar: true,
    });
  }

  @Delete('companies/:id')
  async deleteCompany(@Param('id') id: string, @Res() res: Response) {
    await this.service.deleteCompany(id);
    return res.redirect('/admin/companies');
  }

  @Get('categories')
  async getCategories(@Res() res: Response) {
    const categories = await this.service.getCategories();
    return res.render('admin/categories', {
      categories: categories.map((c) => c.toJSON()),
      showNavbar: true,
    });
  }

  @Post('categories')
  async createCategory(@Body('name') name: string, @Res() res: Response) {
    await this.service.createCategory(name);
    return res.redirect('/admin/categories');
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string, @Res() res: Response) {
    await this.service.deleteCategory(id);
    return res.redirect('/admin/categories');
  }
}
