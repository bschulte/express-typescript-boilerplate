import dotenv from "dotenv";
import { ISequelizeConfig, Sequelize } from "sequelize-typescript";
import { User, Book } from "./index";

dotenv.config();

let options: ISequelizeConfig;

if (process.env.NODE_ENV === "test") {
  console.log("Setting up test DB connection");
  options = {
    database: process.env.TEST_DB_NAME || "db",
    dialect: "mysql",
    modelPaths: [__dirname + "/*.model.ts"],
    operatorsAliases: Sequelize.Op as any,
    password: process.env.TEST_DB_PASSWORD || "password",
    username: process.env.TEST_DB_USER || "username",
    logging: false
  };
} else {
  options = {
    database: process.env.DB_NAME || "db",
    dialect: "mysql",
    modelPaths: [__dirname + "/*.model.ts"],
    operatorsAliases: Sequelize.Op as any,
    password: process.env.DB_PASSWORD || "password",
    username: process.env.DB_USER || "username"
  };
}

export const sequelize: Sequelize = new Sequelize(options);

// Seed the databasse with test data
export const seed = async (): Promise<void> => {
  await User.bulkCreate([
    {
      email: "testuser@domain.org",
      username: "testuser",
      password: "$2a$10$C4kc2s4gChMWTGUOIWxMBeqbYsTJTp7UgXcugzr21nGPLO9bMj7Mi",
      isAdmin: 1
    },
    {
      email: "nonadmin@domain.org",
      username: "nonadmin",
      password: "$2a$10$C4kc2s4gChMWTGUOIWxMBeqbYsTJTp7UgXcugzr21nGPLO9bMj7Mi"
    }
  ]);

  await Book.bulkCreate([
    {
      name: "Test Book 1",
      userId: 1,
      pages: 100
    },
    {
      name: "Another book",
      userId: 1,
      pages: 245
    },
    {
      name: "Good book",
      userId: 2,
      pages: 88
    }
  ]);
};
