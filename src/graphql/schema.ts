import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList
} from "graphql";
import { resolver } from "graphql-sequelize";
import { userType, bookType } from "./types";
import { User, Book } from "../models";

const query: GraphQLObjectType = new GraphQLObjectType({
  name: "Query",
  fields: {
    // Single user search
    user: {
      type: userType,
      args: {
        id: { type: GraphQLInt }
      },
      resolve: resolver(User)
    },

    // Multiple users
    users: {
      type: new GraphQLList(userType),
      resolve: resolver(User)
    },

    // Multiple books search
    books: {
      type: new GraphQLList(bookType),
      resolve: resolver(Book)
    }
  }
});

export default new GraphQLSchema({
  query
});
