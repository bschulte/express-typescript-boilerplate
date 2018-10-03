import dotenv from "dotenv";
import express from "express";

// Initialize any enviornment variables
dotenv.config();

const app: express.Application = express();

const port: number = Number(process.env.PORT) || 3000;

app.listen(port, (err: Error) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`App listening on port: ${port}`);
  }
});
