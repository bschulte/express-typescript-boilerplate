import { GraphQLSchema, GraphQLObjectType, GraphQLInt } from "graphql";
import { attributeFields, resolver } from "graphql-sequelize";
import { User } from "../models";

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: "User",
  fields: attributeFields(User, { exclude: ["password"] })
});

const queryType: GraphQLObjectType = new GraphQLObjectType({
  name: "Query",
  fields: {
    user: {
      type: userType,
      args: {
        id: { type: GraphQLInt }
      },
      resolve: resolver(User)
    }
  }
});

export default new GraphQLSchema({
  query: queryType
});
