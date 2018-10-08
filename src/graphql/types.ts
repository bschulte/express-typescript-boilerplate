import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList
} from "graphql";
import { attributeFields, resolver } from "graphql-sequelize";
import { User, Book } from "../models";

// It's important that fields is a function that returns an object
// in order for types to reference each other
// The function is lazily evaluated during runtime and will not run into any errors
export const bookType: GraphQLObjectType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    ...attributeFields(Book),
    ...{
      user: {
        type: userType,
        resolve: (book: Book) => book.$get("user")
      }
    }
  })
});

export const userType: GraphQLObjectType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    ...attributeFields(User, { exclude: ["password"] }),
    ...{
      books: {
        type: new GraphQLList(bookType),
        resolve: (user: User) => user.$get("books")
      }
    }
  })
});
