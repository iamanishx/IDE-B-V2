import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'Projects'
})
export class Project extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
  })
  declare oauthId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare language: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare visibility: string;
}