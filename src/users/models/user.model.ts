import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare full_name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({
    type: DataType.ENUM('admin', 'company', 'candidate'),
    defaultValue: 'candidate',
  })
  declare role: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare telegram_id: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare is_active: boolean;

  toJSON() {
    const values = super.toJSON();
    delete values.password;
    return values;
  }
}
