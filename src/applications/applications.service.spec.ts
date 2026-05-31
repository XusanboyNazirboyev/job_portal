import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getModelToken } from '@nestjs/sequelize';
import { Application } from './models/application.model';
import { TelegramService } from '../telegram/telegram.service';
import { MailService } from '../mail/mail.service';
import { BadRequestException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockTelegramService = {
    sendStatusNotification: jest.fn().mockResolvedValue(undefined),
  };

  const mockMailService = {
    sendStatusUpdate: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getModelToken(Application), useValue: mockModel },
        { provide: TelegramService, useValue: mockTelegramService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if already applied', async () => {
      mockModel.findOne.mockResolvedValue({ id: 1 });

      await expect(
        service.create({ vacancy_id: 1 } as any, '1', 'resume.pdf'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create application successfully', async () => {
      mockModel.findOne.mockResolvedValue(null);
      mockModel.create.mockResolvedValue({ id: 1, status: 'pending' });

      const result = await service.create(
        { vacancy_id: 1 } as any,
        '1',
        'resume.pdf',
      );
      expect(result).toBeDefined();
      expect(mockModel.create).toHaveBeenCalled();
    });
  });
});
