import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Company } from '../../companies/models/company.model';
import { Category } from '../../categories/models/category.model';

@Table({ tableName: 'vacancies' })
export class Vacancy extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  salary: number;

  @Column({ type: DataType.STRING, allowNull: true })
  location: string;

  @Column({
    type: DataType.ENUM('Full-time', 'Part-time', 'Contract', 'Remote'),
    allowNull: true,
  })
  type: string;

  @ForeignKey(() => Company)
  @Column({ type: DataType.INTEGER })
  company_id: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER })
  category_id: number;

  @BelongsTo(() => Category)
  category: Category;
}
