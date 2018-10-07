import {
  Column,
  CreatedAt,
  Default,
  Model,
  Table,
  Unique,
  UpdatedAt
} from "sequelize-typescript";

@Table
export default class User extends Model<User> {
  @Column
  public username!: string;

  @Unique
  @Column
  public email!: string;

  @Column
  public password!: string;

  @CreatedAt
  public createdAt!: Date;

  @UpdatedAt
  public updatedAt!: Date;

  @Default(0)
  @Column
  public loginAttempts!: number;

  @Default(false)
  @Column
  public locked!: boolean;

  @Column
  public apiKey!: string;
}
