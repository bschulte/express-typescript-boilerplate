import { attributeFields } from "graphql-sequelize";
import { makeExecutableSchema } from "graphql-tools";
import { User, Notification, NotificationStatus } from "../models";
import resolvers from "./resolvers";

// graphql-sequelize's attributeFields converts the Sequelize model into
// the schema style of strict object declaration. Here we are converting
// that representation to the corresponding GraphQL language string
const convertToGql = (attributesList: any) => {
  const result = JSON.stringify(attributesList, null, 2)
    .replace(/"(.*)": {\s*"type": "(.*)"\s.*},?/g, "$1: $2")
    .replace(/[{,}]/g, "");
  return result;
};

const typeDefs = `
  scalar Date

  type Query {
    user(id: Int!): User
    users: [User]
    notifications: [NotificationStatus]
  }

  type Mutation {
    updateNotificationStatus(notificationUuid: String!, newStatus: String!): NotificationStatus
  }

  type User {
    ${convertToGql(attributeFields(User))}
    notifications: [NotificationStatus]
  }

  type Notification {
    ${convertToGql(attributeFields(Notification))}
  }

  type NotificationStatus {
    ${convertToGql(attributeFields(NotificationStatus))}
    notification: Notification
  }

`;

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
