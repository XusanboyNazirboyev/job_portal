import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVacancyDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salary?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  category_id?: number;
}

