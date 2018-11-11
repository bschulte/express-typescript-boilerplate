import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList
} from "graphql";
import { attributeFields, resolver } from "graphql-sequelize";
import { User, SensorRecord } from "../models";

// It's important that fields is a function that returns an object
// in order for types to reference each other
// The function is lazily evaluated during runtime and will not run into any errors
export const sensorRecordType: GraphQLObjectType = new GraphQLObjectType({
  name: "SensorRecord",
  fields: attributeFields(SensorRecord)
});

export const userType: GraphQLObjectType = new GraphQLObjectType({
  name: "User",
  fields: attributeFields(User, { exclude: ["password"] })
});
