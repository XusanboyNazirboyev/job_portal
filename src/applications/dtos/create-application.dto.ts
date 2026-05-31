import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';


export class CreateApplicationDto {
  @IsInt()
  @Type(() => Number)
  vacancy_id: number;
}
