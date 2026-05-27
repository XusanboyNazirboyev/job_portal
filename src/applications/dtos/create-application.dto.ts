import { IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  vacancy_id: number;
}
