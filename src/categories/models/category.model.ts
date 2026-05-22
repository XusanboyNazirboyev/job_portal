import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'categories' })
export class Category extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;
}
