import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import swagger from "swagger-ui-express";

import { ERROR, INFO, logger, LoggerStream } from "./logging";
import { sequelize } from "./models/sequelize";
import { userRouter } from "./routes";

// Initialize any enviornment variables
dotenv.config();

const app: express.Application = express();

const port: number = Number(process.env.PORT) || 3000;

(async (): Promise<void> => {
  // Start up the database
  await sequelize.sync();

  // JSON body parser
  app.use(bodyParser.json());

  // Morgan logging
  app.use(morgan("combined", { stream: new LoggerStream() }));

  // Swagger API documentation
  const swaggerDocument = require("../swagger.json");
  app.use("/api-docs", swagger.serve, swagger.setup(swaggerDocument));

  // Routes
  app.use("/user", userRouter);

  app.listen(port, (err: Error) => {
    if (err) {
      logger.log(ERROR, err.message);
    } else {
      logger.log(INFO, `App listening on port: ${port}`);
    }
  });
})();
