import dotenv from "dotenv";
import express from "express";

import { ERROR, INFO, logger } from "./logging";
import { sequelize } from "./sequelize";

// Initialize any enviornment variables
dotenv.config();

const app: express.Application = express();

const port: number = Number(process.env.PORT) || 3000;

(async () => {
  // Start up the database
  await sequelize.sync();

  app.listen(port, (err: Error) => {
    if (err) {
      logger.log(ERROR, err.message);
    } else {
      logger.log(INFO, `App listening on port: ${port}`);
    }
  });
})();
