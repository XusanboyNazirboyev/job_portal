import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import type { Response } from 'express';
import { UpdateStatusDto } from './dtos/update-status.dto';
import { ResumeValidationPipe } from '@/common/pipes/resume-validation.pipe';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  @Post()
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: './src/public/uploads/resumes',
        filename: (req, file, cb) => {
          const name = Date.now() + extname(file.originalname);
          cb(null, name);
        },
      }),
    }),
  )
  async create(
    @Body() body: CreateApplicationDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      await this.service.create(body, req.user.id, file?.filename);
      return res.redirect('/applications/my');
    } catch (error: any) {
      return res.redirect(
        `/vacancies/${body.vacancy_id}?error=${error.message}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('candidate')
  @Get('my')
  async getMy(@Req() req: any, @Res() res: Response) {
    const applications = await this.service.getAll(req.user.id);
    return res.render('applications/my', {
      applications: applications.map((a) => a.toJSON()),
      showNavbar: true,
    });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Get('vacancy/:id')
  async findByVacancy(
    @Param('id', ParseIntPipe) id: string,
    @Res() res: Response,
  ) {
    const applications = await this.service.findByVacancy(id);
    return res.render('applications/list', {
      applications: applications.map((a) => a.toJSON()),
      showNavbar: true,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Post(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @Body('vacancy_id') vacancyId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    await this.service.updateStatus(id, dto);
    return res.redirect(`/companies/${vacancyId}/applications`);
  }
}
