import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Vacancy } from '@/vacancies/models/vacancy.model';

@Table({ tableName: 'companies' })
export class Company extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING, allowNull: true })
  logo: string;

  @Column({ type: DataType.STRING, allowNull: true })
  website: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  owner_id: number;

  @HasMany(() => Vacancy)
  Vacancies: Vacancy[];
  
  @BelongsTo(() => User)
  owner: User;
}
