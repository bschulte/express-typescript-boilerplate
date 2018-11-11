import express, { Request, Response } from "express";
import graphHTTP from "express-graphql";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import swagger from "swagger-ui-express";
import rateLimit from "express-rate-limit";
import path from "path";

import { ERROR, INFO, logger, LoggerStream } from "./logging";
import { sequelize } from "./models/sequelize";
import paramChecker from "./middleware/paramChecker";
import {
  authenticateApiDocsUser,
  authenticateUser
} from "./middleware/authentication";
import { userRouter, notificationRouter } from "./routes";
import schema from "./graphql/schema";

// Initialize any environment variables
dotenv.config();

const app: express.Application = express();

const port: number = Number(process.env.PORT) || 3000;

(async (): Promise<void> => {
  // Start up the database
  await sequelize.sync();

  // JSON body parser
  app.use(bodyParser.json({ limit: "10mb" }));

  // Morgan logging
  app.use(morgan("combined", { stream: new LoggerStream() }));

  // Use param checker middleware globally for routes
  app.use(paramChecker);

  // Server static files from the public folder
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Swagger API documentation
  const swaggerDocument: object = require("../swagger.json");
  app.use(
    "/api-docs",
    authenticateApiDocsUser,
    swagger.serve,
    swagger.setup(swaggerDocument)
  );

  // GraphQL
  app.use(
    "/query",
    authenticateUser,
    graphHTTP(async (req: Request, res: Response) => ({
      schema,
      graphiql: true,
      context: { user: res.locals.user }
    }))
  );

  // Trust the proxy for the client's IP since we're being a reverse proxy
  app.enable("trust proxy");

  // Use rate limiting for all API routes
  const limiterOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // 1000 requests per IP per limit window (windowMs)
  };
  const limiter = rateLimit(limiterOptions);
  app.use(limiter);

  // Routes
  app.use("/users", userRouter);
  app.use("/notification", notificationRouter);

  app.listen(port, (err: Error) => {
    if (err) {
      logger.log(ERROR, err.message);
    } else {
      logger.log(INFO, `App listening on port: ${port}`);
    }
  });
})();
