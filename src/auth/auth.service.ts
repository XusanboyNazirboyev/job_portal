import { User } from '@/users/models/user.model';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Company } from '@/companies/models/company.model';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Company) private companyModel: typeof Company,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    const existing = await this.userModel.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPass = await this.hashPass(dto.password);

    const user = await this.userModel.create({
      ...dto,
      password: hashedPass,
    });

    if (dto.role === 'company') {
      await this.companyModel.create({
        name: dto.full_name,
        owner_id: user.getDataValue('id'),
      });
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    this.setTokenCookies(res, accessToken, refreshToken);
    await this.mailService.sendWelcome(dto.email, dto.full_name);
    // return {
    //   success: true,
    //   data: user,
    // };
  }

  async login(dto: LoginDto, res: Response) {
    const existing = await this.userModel.findOne({
      where: { email: dto.email },
      attributes: ['id', 'email', 'password', 'role'],
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const isSame = await this.comparePass(
      dto.password,
      existing.getDataValue('password'),
    );

    if (!isSame) {
      throw new UnauthorizedException('Invalid password');
    }
    const payload = {
      id: existing.getDataValue('id'),
      role: existing.getDataValue('role'),
    };
    // const payload = { id: existing.id, role: existing.role };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    this.setTokenCookies(res, accessToken, refreshToken);

    return existing.getDataValue('role');
  }

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.['refreshToken'];
    if (!token) throw new UnauthorizedException('Token not given');

    let decoded: { id: number; role: string };
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const user = await this.userModel.findByPk(decoded.id);
    if (!user) throw new NotFoundException('User not found');

    const accessToken = await this.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ success: true, message: 'Token refreshed' });
  }

  async forgotPassword() {}

  async resetPasssword() {}

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private async hashPass(pass: string): Promise<string> {
    const hashed = await bcrypt.hash(pass, 10);
    return hashed;
  }

  private async comparePass(
    orgPass: string,
    hashedPass: string,
  ): Promise<boolean> {
    const isSame = await bcrypt.compare(orgPass, hashedPass);
    return isSame;
  }

  private async generateAccessToken(payload: { id: number; role: string }) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TIME'),
    });
  }

  private async generateRefreshToken(payload: { id: number; role: string }) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TIME'),
    });
  }
}
