import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import type { Response } from 'express';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Get('panel')
  async getPanel(@Req() req: any, @Res() res: Response) {
    const company = await this.service.getPanel(req.user.id);
    return res.render('companies/panel', {
      company: company.toJSON(),
      showNavbar: true,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Get('create')
  async createPage(@Res() res: Response) {
    const categories = await this.service.getCategories();
    return res.render('companies/create', {
      categories: categories.map((c) => c.toJSON()),
      showNavbar: true,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Post()
  async create(
    @Body() body: CreateVacancyDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      await this.service.create(req.user.id, body);
      return res.redirect('/companies/panel');
    } catch (error: any) {
      return res.render('companies/create', {
        error: error.message,
        showNavbar: true,
      });
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Get(':id/edit')
  async editPage(
    @Param('id', ParseIntPipe) id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const vacancy = await this.service.getVacancy(req.user.id, id);
    return res.render('companies/edit', { vacancy, showNavbar: true });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() dto: UpdateVacancyDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      await this.service.update(req.user.id, id, dto);
      return res.redirect('/companies/panel');
    } catch (error: any) {
      return res.render('companies/edit', {
        error: error.message,
        showNavbar: true,
      });
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    await this.service.delete(req.user.id, id);
    return res.redirect('/companies/panel');
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Get(':id/applications')
  async getApplications(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const applications = await this.service.getApplications(req.user.id, id);
   return res.render('companies/applications', {
     applications: applications.map((a) => ({
       ...a.toJSON(),
       status: a.getDataValue('status'),
       vacancy_id: id,
     })),
     showNavbar: true,
   });
  }
}
