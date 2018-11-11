import {
  Column,
  CreatedAt,
  Model,
  Table,
  BelongsTo,
  HasMany,
  UpdatedAt
} from "sequelize-typescript";
import Notification from "./notification.model";
import blockStringValue from "graphql/language/blockStringValue";
import { User } from ".";

@Table
export default class NotificationStatus extends Model<NotificationStatus> {
  @Column
  public userId!: number;

  @Column
  public notificationId!: number;

  @Column
  public status!: string;

  @CreatedAt
  public createdAt!: Date;

  @UpdatedAt
  public updatedAt!: Date;

  @Column
  public uuid!: string;

  @BelongsTo(() => Notification, "notificationId")
  public notification: Notification;

  @BelongsTo(() => User, "userId")
  public user: User;
}
