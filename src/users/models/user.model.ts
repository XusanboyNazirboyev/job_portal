import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  full_name: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({
    type: DataType.ENUM('admin', 'company', 'candidate'),
    defaultValue: 'candidate',
  })
  role: string;

  @Column({ type: DataType.STRING, allowNull: true })
  telegram_id: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_active: boolean;
  
  toJSON() {
    const values = super.toJSON();
    delete values.password;
    return values;
  }
}
