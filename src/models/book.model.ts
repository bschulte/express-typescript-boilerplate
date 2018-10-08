import {
  Column,
  CreatedAt,
  Model,
  Table,
  UpdatedAt,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import User from "./user.model";

@Table
export default class Book extends Model<Book> {
  @Column
  public name!: string;

  @Column
  public pages!: number;

  @CreatedAt
  public createdAt!: Date;

  @UpdatedAt
  public updatedAt!: Date;

  @ForeignKey(() => User)
  @Column
  public userId!: number;

  @BelongsTo(() => User)
  public user: User;
}
