import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsInt()
  @Type(() => Number)
  category_id: number;
}
