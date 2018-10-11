import { sequelize, seed } from "../models/sequelize";

let hasRun = false;

beforeEach(async () => {
  if (!hasRun) {
    console.log("Before the test!");

    await sequelize.sync({ force: true });
    await seed();

    hasRun = true;
  }
});
