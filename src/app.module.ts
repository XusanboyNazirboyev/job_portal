import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from "@nestjs/sequelize"
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ApplicationsModule } from './applications/applications.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { CategoriesModule } from './categories/categories.module';
import { User } from './users/models/user.model';
import { Company } from './companies/models/company.model';
import { Vacancy } from './vacancies/models/vacancy.model';
import { Application } from './applications/models/application.model';
import { Category } from './categories/models/category.model';
import { AdminModule } from './admin/admin.module';
import { RoleMiddleware } from './common/middleware/role.middleware';
import { TelegramModule } from './telegram/telegram.module';
import { MailModule } from './mail/mail.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      logging: process.env.NODE_ENV !== 'production' ? console.log : false,
      synchronize: true,
      sync: {
        alter: true,
        force: process.env.NODE_ENV === 'development',
      },
      autoLoadModels: true,
      models: [User, Company, Vacancy, Application, Category],
    }),
    AuthModule,
    ApplicationsModule,
    UsersModule,
    CompaniesModule,
    VacanciesModule,
    CategoriesModule,
    AdminModule,
    TelegramModule,
    MailModule,
    HomeModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RoleMiddleware).forRoutes('*');
  }
}
