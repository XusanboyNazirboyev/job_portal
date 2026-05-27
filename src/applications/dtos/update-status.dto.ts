import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(['pending', 'accepted', 'rejected'])
  status: string;

  @IsString()
  @IsOptional()
  vacancy_id: string;
}
