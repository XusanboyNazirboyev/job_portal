import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVacancyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salary: number;

  @IsString()
  @IsOptional()
  location: string;

  @IsEnum(['Full-time', 'Part-time', 'Contract', 'Remote'], {
    message:
      "Type faqat 'Full-time', 'Part-time', 'Contract' yoki 'Remote' bo'lishi mumkin",
  })
  type: string;

  @IsInt()
  @Type(() => Number)
  category_id: number;
}
