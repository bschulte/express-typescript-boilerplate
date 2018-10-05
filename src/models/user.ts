import {
  Column,
  CreatedAt,
  Model,
  Table,
  UpdatedAt
} from "sequelize-typescript";

@Table
export default class User extends Model<User> {
  @Column
  public email!: string;

  @Column
  public password!: string;

  @CreatedAt
  @Column
  public createdAt!: Date;

  @UpdatedAt
  @Column
  public updatedAt!: Date;

  @Column
  public loginAttempts!: number;

  @Column
  public locked!: number;
}
