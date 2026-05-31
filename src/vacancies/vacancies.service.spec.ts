import { Test, TestingModule } from '@nestjs/testing';
import { VacanciesService } from './vacancies.service';
import { getModelToken } from '@nestjs/sequelize';
import { Vacancy } from './models/vacancy.model';
import { NotFoundException } from '@nestjs/common';

describe('VacanciesService', () => {
  let service: VacanciesService;

  const mockModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacanciesService,
        { provide: getModelToken(Vacancy), useValue: mockModel },
      ],
    }).compile();

    service = module.get<VacanciesService>(VacanciesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all vacancies', async () => {
      mockModel.findAll.mockResolvedValue([
        {
          id: 1,
          title: 'Backend Developer',
          toJSON: () => ({ id: 1, title: 'Backend Developer' }),
        },
      ]);
      const result = await service.getAll();
      expect(result).toHaveLength(1);
    });

  });

  describe('getOne', () => {
    it('should throw NotFoundException if not found', async () => {
      mockModel.findByPk.mockResolvedValue(null);
      await expect(service.getOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should return vacancy if found', async () => {
      mockModel.findByPk.mockResolvedValue({
        id: 1,
        title: 'Backend Developer',
        toJSON: () => ({ id: 1, title: 'Backend Developer' }),
      });
      const result = await service.getOne('1');
      expect(result).toBeDefined();
    });
  });
});
