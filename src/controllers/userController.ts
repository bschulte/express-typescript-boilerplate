import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import owasp from "owasp-password-strength-test";

import { DEBUG, ERROR, logger, WARN } from "../logging/";
import { User } from "../models";
import { sequelize } from "../models/sequelize";
// import emailer from "../Helpers/Email";

// Generate a random string. Used for API key and random token creation
const generateRandomString = (strLength: number): string => {
  // Create a random string (like for generating API key)
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < strLength; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Create a user
export const createUser = async (
  username: string,
  email: string
): Promise<any> => {
  // Create random password
  const password: string = generateRandomString(24);
  // Create API key
  const apiKey: string = generateRandomString(36);

  logger.log(DEBUG, `Creating new user: ${email}`);
  const passHash: string = bcrypt.hashSync(password, 10);

  try {
    const user: User = await User.create({
      apiKey,
      email,
      password: passHash,
      username
    });

    logger.log("debug", `User entered into DB: ${JSON.stringify(user)}`);

    return { successfullyCreatedUser: true, generatedPassword: password };
  } catch (err) {
    logger.log("warn", `Error creating user DB entry: ${err}`);
    return { successfullyCreatedUser: false };
  }
};

// Get a user by ID
export const getUser = async (
  userId: number,
  authenticatedUser: User
): Promise<any> => {
  // Check if the authenticated user is an admin
  if (!authenticatedUser.isAdmin) {
    return null;
  }

  const user = await User.findOne({
    attributes: { exclude: ["password"] },
    where: { id: userId }
  });

  if (user) {
    return user;
  } else {
    logger.log(WARN, `Could not find user! Provided is: ${userId}`);
    return null;
  }
};

// Delete a user by ID
export const deleteUser = async (userId: number): Promise<boolean> => {
  try {
    await User.destroy({ where: { id: userId } });
    logger.log(DEBUG, `Deleted user, id: ${userId}`);
    return true;
  } catch (err) {
    logger.log(WARN, `Error deleting user: ${err}`);
    return false;
  }
};

// Check if a valid username and password is provided and return a JWT if so
export const login = async (email: string, password: string): Promise<any> => {
  const user = await User.findOne({
    where: {
      email
    }
  });

  if (user) {
    logger.log(DEBUG, `Attempting to login user: ${user.email}`);

    // Check if the account is locked
    if (user.locked) {
      logger.log(ERROR, "User tried to log into locked account");
      return {
        data: {
          msg:
            "This account is locked, please contact the system administrator for assistance."
        },
        status: 401
      };
    }

    // Verify the password
    if (bcrypt.compareSync(password, user.password)) {
      // Password correct, create JWT token
      const token = jwt.sign(user.dataValues, process.env.APP_KEY, {
        expiresIn: "12h"
      });
      // Update the last logged in field for the user
      await user.updateAttributes({
        lastLogin: sequelize.fn("NOW"),
        loginAttempts: 0
      });
      return { status: 200, data: { token }, user };
    } else {
      // Invalid password given, add the bad login attempt to the database
      await user.increment("loginAttempts");
      logger.log(WARN, "Invalid password attempt");
      if (user.loginAttempts >= 5) {
        await user.updateAttributes({
          locked: 1
        });
        logger.log(ERROR, "Account now locked from too many login attempts");
        return {
          data: {
            msg:
              "Account is locked due to too many login attempts, please contact system administrator for assistance."
          },
          status: 401
        };
      } else {
        return {
          data: {
            msg:
              "Invalid email and/or password. Upon 5 incorrect logins the account will be locked."
          },
          status: 401
        };
      }
    }
  } else {
    logger.log("error", `Login attempt unsuccessful: ${email}`);
    return {
      data: {
        msg:
          "Invalid email and/or password. Upon 5 incorrect logins the account will be locked."
      },
      status: 401
    };
  }
};

// Attempt to change the user's password
export const changePassword = async (
  user: User,
  currentPass: string,
  newPass: string
): Promise<any> => {
  if (bcrypt.compareSync(currentPass, user.password)) {
    // Check for password minimums
    const passTestResult = owasp.test(newPass);
    if (!passTestResult.strong) {
      logger.log(
        ERROR,
        `Invalid new password entered: ${user.email}, errors: ${
          passTestResult.errors
        }`
      );
      return {
        data: {
          errors: passTestResult.errors,
          msg: "Invalid new password"
        },
        status: 400
      };
    }
    // If the user provided the correct password, and their new password meets the
    // minimum requirements, update their user record with the new password
    const userRecord = await User.findOne({
      where: { email: user.email }
    });
    await userRecord.updateAttributes({
      password: bcrypt.hashSync(newPass, 10)
    });
    return { status: 200, data: { success: true } };
  } else {
    logger.log(DEBUG, "Incorrect password given during password change");
    return {
      data: {
        msg: "Incorrect password",
        success: false
      },
      status: 401
    };
  }
};
/*
  // Update the user's config option
  async updateUserConfig(user, key, value) {
    logger.log(
      'debug',
      `Updating user config: ${key} -> ${value}, for user: ${user.email}`
    )
    const configOption = await db.UserConfig.findOne({
      where: { user_id: user.id, key: key }
    })
    if (configOption) {
      await configOption.updateAttributes({
        value: value
      })
    } else {
      return { status: 400, data: { msg: 'Invalid config option' } }
    }
    return { status: 200, data: { msg: 'Updated setting properly' } }
  },
  async generatePasswordResetToken(emailAddress) {
    const user = await db.User.findOne({ where: { email: emailAddress } })
    if (!user) {
      logger.log(
        'warn',
        `Forgotten password request - Could not find user: ${emailAddress}`
      )
      // We want to return status of 200 to not let the client know if
      // the email exists or not
      return { status: 200 }
    }
    // Generate the random reset token
    const token = randToken.generate(32)
    // Set the user database entry with the token and the expiration date-time
    await user.updateAttributes({
      reset_token: token,
      reset_token_expires: moment().add(4, 'hours')
    })
    // Send the user reset email
    await emailer.sendPasswordResetEmail(emailAddress, token)
    return { status: 200 }
  },
  // Handles a forgotten password reset request
  async resetPassword(token, newPassword, newPasswordDuplicate) {
    logger.log('debug', 'Resetting password for user')
    // Find the user with the associated token
    const user = await db.User.findOne({ where: { reset_token: token } })
    if (!user) {
      logger.log('error', `Could not find user with given token: ${token}`)
      return { status: 400, data: { msg: 'Invalid token' } }
    }
    // Check if the token is still valid
    if (
      moment
        .utc(user.reset_token_expires)
        .local()
        .diff(moment(), 'seconds') < 0
    ) {
      logger.log('error', `Expired token for password reset used: ${token}`)
      return { status: 400, data: { msg: 'Expired token' } }
    }
    // Check if the passwords match
    if (newPassword !== newPasswordDuplicate) {
      return { status: 400, data: { msg: 'Passwords do not match' } }
    }
    // Check new password strength
    const passTestResult = owasp.test(newPassword)
    if (!passTestResult.strong) {
      logger.log(
        'error',
        `Invalid new password entered: ${user.email}, errors: ${
          passTestResult.errors
        }`
      )
      return {
        status: 400,
        data: { msg: `Invalid new password. Errors: ${passTestResult.errors}` }
      }
    }
    // Update the user's password
    // Also remove the reset token and the token's expiration date
    await user.updateAttributes({
      password: bcrypt.hashSync(newPassword, 10),
      reset_token: null,
      reset_token_expires: null
    })
    await emailer.sendPasswordChangeNotification(user.email)
    return { status: 200, data: { success: true } }
  },
*/
