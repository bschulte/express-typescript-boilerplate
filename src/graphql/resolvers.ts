import { GraphQLDateTime } from "graphql-iso-date";

import { User } from "../models";
import { getUser } from "../controllers/userController";
import {
  updateNotificationStatus,
  getUserNotifications
} from "../controllers/notificationController";

// Resolvers for GraphQL queries
export default {
  Query: {
    // Single user
    user: (obj: any, args: any, context: any) => getUser(args.id, context.user),

    // Multiple users
    users: () => User.findAll({ attributes: { exclude: ["password"] } }),

    // Get a user's notifications
    notifications: (obj: any, args: any, context: any) => {
      return getUserNotifications(context.user.id);
    }
  },

  Date: GraphQLDateTime,

  User: {
    notifications: (user: User) => user.$get("notifications")
  },

  Mutation: {
    updateNotificationStatus: (
      obj: any,
      { notificationUuid, newStatus }: any,
      context: any
    ) => {
      return updateNotificationStatus(
        context.user.id,
        notificationUuid,
        newStatus
      );
    }
  }
};
