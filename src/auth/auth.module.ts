import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@/users/models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { Company } from '@/companies/models/company.model';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Company]),

    JwtModule.register({
      global: true,
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
