import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Vacancy } from '../../vacancies/models/vacancy.model';

@Table({ tableName: 'applications' })
export class Application extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Vacancy)
  @Column({ type: DataType.INTEGER })
  vacancy_id: number;

  @BelongsTo(() => Vacancy)
  vacancy: Vacancy;

  @Column({ type: DataType.STRING, allowNull: true })
  resume: string;

  @Column({
    type: DataType.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  })
  status: string;
}
