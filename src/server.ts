import express from "express";
import graphHTTP from "express-graphql";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import swagger from "swagger-ui-express";

import { ERROR, INFO, logger, LoggerStream } from "./logging";
import { sequelize } from "./models/sequelize";
import paramChecker from "./middleware/paramChecker";
import { userRouter } from "./routes";
import schema from "./graphql/schema";

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

  // Use param checker middleware globally for routes
  app.use(paramChecker);

  // Swagger API documentation
  const swaggerDocument: object = require("../swagger.json");
  app.use("/api-docs", swagger.serve, swagger.setup(swaggerDocument));

  // GraphQL
  app.use(
    "/query",
    graphHTTP({
      schema,
      graphiql: true
    })
  );

  // Routes
  app.use("/users", userRouter);

  app.listen(port, (err: Error) => {
    if (err) {
      logger.log(ERROR, err.message);
    } else {
      logger.log(INFO, `App listening on port: ${port}`);
    }
  });
})();
