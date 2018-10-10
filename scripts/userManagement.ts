import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import readlineSync from "readline-sync";
import chalk from "chalk";
import figlet from "figlet";

const log = console.log;

import { sequelize } from "../src/models/sequelize";
import { User } from "../src/models";
import usersController = require("../src/controllers/userController");

// Create a new user for the portal
const createUser = async () => {
  const username = readlineSync.question(chalk.cyan("Username: "));
  const email = readlineSync.question(chalk.cyan("Email: "));

  const {
    successfullyCreatedUser,
    generatedPassword
  } = await usersController.createUser(username, email);

  if (successfullyCreatedUser) {
    log(chalk.green("Successfully created user!"));
    log("Password:", chalk.yellow(generatedPassword));
  } else {
    log(chalk.red("Failed to create user, check server logs!"));
  }

  process.exit(0);
};

// Delete a user
const deleteUser = async () => {
  const users = await User.findAll();
  log(chalk.magenta("|-------------------------"));
  log(chalk.magenta("|- User id || User name -|"));
  log(chalk.magenta("--------------------------"));

  for (const user of users) {
    log(
      chalk.magenta("| ") + user.id + chalk.magenta(" \t   || ") + user.username
    );
  }
  log(chalk.magenta("--------------------------"));
  const userId = readlineSync.question(chalk.cyan("user_id to delete: "));

  const successfullyDeletedUser = await usersController.deleteUser(
    parseInt(userId, 10)
  );

  if (successfullyDeletedUser) {
    log(chalk.green("Deleted user!"));
    process.exit(0);
  } else {
    log(chalk.red("Error deleting user, check server logs"));
    process.exit(-3);
  }
};

// Change the users password
const changeUserPassword = async () => {
  const email = readlineSync.question(chalk.yellow("Email: "));
  const password = readlineSync.question(chalk.yellow("Password: "), {
    hideEchoBack: true
  });

  try {
    const user = await User.findOne({ where: { email } });
    await user.updateAttributes({
      password: bcrypt.hashSync(password, 10)
    });
  } catch (err) {
    log(chalk.red(err));
    process.exit(-3);
  }

  log(chalk.green("Updated user's password!"));
  process.exit(0);
};

// --------------------------------------------------------------------- //
// Main section                                                          //
// --------------------------------------------------------------------- //
(async () => {
  await sequelize.sync();

  log(figlet.textSync("User Management"));

  log(chalk.underline.blue.bgBlack.bold("Choose an option:"));
  log(chalk.yellow.bgBlack.bold("[1]: ") + "Create user");
  log(chalk.yellow.bgBlack.bold("[2]: ") + "Delete user");
  log(chalk.yellow.bgBlack.bold("[3]: ") + "Change user password");

  const selection = readlineSync.question("Selection:");

  switch (selection) {
    case "1":
      createUser();
      break;
    case "2":
      deleteUser();
      break;
    case "3":
      changeUserPassword();
      break;
    default:
      log(chalk.red("Invalid selection"));
  }
})();
