import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RoleMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request & { user: any }, res: Response, next: NextFunction) {
    const token = req.cookies?.['accessToken'];
    if (token) {
      try {
        const decoded = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
        });
        req.user = decoded;
        res.locals.isCandidate = decoded.role === 'candidate';
        res.locals.isCompany = decoded.role === 'company';
        res.locals.isAdmin = decoded.role === 'admin';
        res.locals.isLoggedIn = true;
      } catch {
        res.locals.isLoggedIn = false;
      }
    }
    next();
  }
}
