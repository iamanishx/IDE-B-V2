import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model<User> {  
  @Column({ unique: true })
  oauthId: string;  // Removed `!` to prevent shadowing

  @Column
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, allowNull: true })
  userId: string | null; // Removed `?` to use `null` explicitly instead of `undefined`
}