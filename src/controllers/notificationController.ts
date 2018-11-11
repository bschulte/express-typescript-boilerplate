import uuid from "uuid/v4";

import { logger, ERROR, DEBUG } from "../logging";
import Notification from "../models/notification.model";
import NotificationStatus from "../models/notificationStatus.model";

// Create a new notification for the given users
export const createNewNotification = async (
  notificationHtml: string,
  title: string,
  userIds: number[]
): Promise<boolean> => {
  try {
    // Create the notification itself first
    const notification = await Notification.create({ notificationHtml, title });
    for (const userId of userIds) {
      await NotificationStatus.create({
        userId,
        notificationId: notification.id,
        status: "UNREAD",
        uuid: uuid()
      });
    }
  } catch (err) {
    logger.log(ERROR, `Error creating new notification ${err}`);
    return false;
  }
  return true;
};

export const updateNotificationStatus = async (
  userId: number,
  notificationUuid: string,
  newStatus: string
) => {
  // Check to see if the notification belongs to the user or not
  const notificationStatus = await NotificationStatus.findOne({
    where: { uuid: notificationUuid, userId }
  });

  if (!notificationStatus) {
    return { success: false, status: 403, msg: "Forbidden resource" };
  }

  logger.log(
    DEBUG,
    `Updating notification: ${notificationUuid} for user: ${userId} to status: ${newStatus}`
  );

  // Update the status
  try {
    notificationStatus.updateAttributes({ status: newStatus });
  } catch (err) {
    logger.log(ERROR, `Error updating notification status: ${err}`);
  }

  return notificationStatus;
};

export const getUserNotifications = async (userId: number) => {
  const notifications = await NotificationStatus.findAll({
    where: { userId },
    include: [Notification]
  });

  return notifications;
};
