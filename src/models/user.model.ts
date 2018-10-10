import {
  Column,
  CreatedAt,
  Default,
  Model,
  Table,
  Unique,
  UpdatedAt,
  HasMany
} from "sequelize-typescript";

import Book from "./book.model";

@Table
export default class User extends Model<User> {
  @Column
  public username!: string;

  @Column
  public email!: string;

  @Column
  public password!: string;

  @CreatedAt
  public createdAt!: Date;

  @UpdatedAt
  public updatedAt!: Date;

  @Column
  public lastLogin!: Date;

  @Default(0)
  @Column
  public loginAttempts!: number;

  @Default(false)
  @Column
  public locked!: boolean;

  @Column
  public apiKey!: string;

  @Default(0)
  @Column
  public isAdmin!: number;

  @HasMany(() => Book)
  public books: Book[];
}
