import {
  Column,
  CreatedAt,
  Model,
  Table,
  BelongsTo,
  HasMany
} from "sequelize-typescript";

@Table
export default class Notification extends Model<Notification> {
  @Column
  public notificationHtml!: string;

  @Column
  public title!: string;
}
