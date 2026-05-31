import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { Company } from '../companies/models/company.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockCompanyModel = {
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock_token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock_value'),
  };

  const mockMailService = {
    sendWelcome: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User), useValue: mockUserModel },
        { provide: getModelToken(Company), useValue: mockCompanyModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ✅ Register tests
  describe('register', () => {
    it('should throw BadRequestException if email exists', async () => {
      mockUserModel.findOne.mockResolvedValue({
        id: 1,
        email: 'test@gmail.com',
      });

      await expect(
        service.register(
          {
            email: 'test@gmail.com',
            password: '123456',
            full_name: 'Test',
            role: 'candidate',
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create user successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        id: 1,
        email: 'new@gmail.com',
        role: 'candidate',
        getDataValue: jest.fn().mockReturnValue(1),
      });

      const res = { cookie: jest.fn() };

      await expect(
        service.register(
          {
            email: 'new@gmail.com',
            password: '123456',
            full_name: 'Test',
            role: 'candidate',
          } as any,
          res as any,
        ),
      ).resolves.not.toThrow();

      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockMailService.sendWelcome).toHaveBeenCalled();
    });
  });

  // ✅ Login tests
  describe('login', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'notfound@gmail.com', password: '123456' } as any,
          {} as any,
        ),
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException if password wrong', async () => {
      mockUserModel.findOne.mockResolvedValue({
        getDataValue: jest.fn((key) => {
          if (key === 'password') return '$2b$10$wronghash';
          if (key === 'id') return 1;
          if (key === 'role') return 'candidate';
        }),
      });

      await expect(
        service.login(
          { email: 'test@gmail.com', password: 'wrongpass' } as any,
          {} as any,
        ),
      ).rejects.toThrow('Invalid password');
    });
  });
});
