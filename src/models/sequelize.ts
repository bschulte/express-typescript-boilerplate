import dotenv from "dotenv";
import { ISequelizeConfig, Sequelize } from "sequelize-typescript";

dotenv.config();

const options: ISequelizeConfig = {
  database: process.env.DB_NAME || "db",
  dialect: "mysql",
  modelPaths: [__dirname + "/*.model.ts"],
  operatorsAliases: Sequelize.Op as any,
  password: process.env.DB_PASSWORD || "password",
  username: process.env.DB_USER || "username"
};

export const sequelize = new Sequelize(options);
