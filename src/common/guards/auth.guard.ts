import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: any }>();

    const token = request.cookies?.['accessToken'];
    if (!token) {
      throw new UnauthorizedException('Token not given');
    }

    request.user = await this.verifyToken(token);
    return true;
  }

  private async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token already expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Token is invalid');
      }
      throw new InternalServerErrorException();
    }
  }
}
