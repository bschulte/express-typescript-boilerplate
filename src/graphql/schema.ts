import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList
} from "graphql";
import { attributeFields, resolver } from "graphql-sequelize";
import { User, Book } from "../models";

const bookType: GraphQLObjectType = new GraphQLObjectType({
  name: "Book",
  fields: attributeFields(Book)
});

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: "User",
  fields: {
    ...attributeFields(User, { exclude: ["password"] }),
    ...{
      books: {
        type: new GraphQLList(bookType),
        resolve: (user: User) => user.$get("books")
      }
    }
  }
});

const queryType: GraphQLObjectType = new GraphQLObjectType({
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
  query: queryType
});
