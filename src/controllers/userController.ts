import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";
import owasp from "owasp-password-strength-test";
import randToken from "rand-token";

// import { db } from "../Models/database";

import { DEBUG, ERROR, logger } from "../logging/";
// import emailer from "../Helpers/Email";

export const generateRandomString = (strLength: number): string => {
  // Create a random string (like for generating API key)
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < strLength; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const createUser = async (username: string, email: string) => {
  // Create random password
  const password: string = generateRandomString(24);
  // Create API key
  const apiKey: string = generateRandomString(36);

  logger.log(DEBUG, `Creating new user: ${email}`);
  const passHash: string = bcrypt.hashSync(password, 10);

  let result;
  try {
    result = await db.User.create({
      api_key: apiKey,
      email,
      password: passHash,
      username
    });
  } catch (err) {
    logger.log("warn", `Error creating user DB entry: ${err}`);
    return { successfullyCreatedUser: false };
  }
  logger.log(
    "debug",
    `User entered into DB: ${JSON.stringify(result.dataValues)}`
  );

  // Create the default user pages
  logger.log("debug", "Creating default user pages...");
  const defaultPages = require(__dirname +
    "/../bin/management/defaultUserPages.json");
  for (const page of defaultPages) {
    try {
      await db.UserPage.create({
        user_id: result.id,
        name: page.name,
        nav_json: page.nav_json,
        enabled: page.enabled,
        order: page.order
      });
    } catch (err) {
      logger.log("error", `Error creating user page: ${err}`);
      return { successfullyCreatedUser: false };
    }
  }
  // Create the default config values for the user
  logger.log("debug", "Creating default user config values...");
  const defaultConfig = require(__dirname +
    "/../bin/management/defaultUserConfig.json");
  for (const configValue of defaultConfig) {
    try {
      await db.UserConfig.create({
        user_id: result.id,
        key: configValue.key,
        value: configValue.value
      });
    } catch (err) {
      logger.log("error", `Error creating user config value: ${err}`);
      return { successfullyCreatedUser: false };
    }
  }
  // Create the default access values for the user
  logger.log("debug", "Creating default user access values...");
  const defaultAccess = require(__dirname +
    "/../bin/management/defaultUserAccess.json");
  for (const accessValue of defaultAccess) {
    try {
      await db.UserAccess.create({
        user_id: result.id,
        key: accessValue.key,
        value: accessValue.value,
        type: accessValue.type
      });
    } catch (err) {
      logger.log("error", `Error creating user access value: ${err}`);
      return { successfullyCreatedUser: false };
    }
  }
  // Add the default user risk score profile
  logger.log("debug", "Creating default active risk profile...");
  await db.ActiveRiskProfile.create({
    user_id: result.id,
    risk_profile_id: 1,
    custom: 0
  });
  return { successfullyCreatedUser: true, generatedPassword: password };
};
// Delete a user
/*
  async deleteUser(userId) {
    try {
      await db.User.destroy({ where: { id: userId } })
      await db.UserPage.destroy({ where: { user_id: userId } })
      await db.ActiveRiskProfile.destroy({ where: { user_id: userId } })
      await db.UserConfig.destroy({ where: { user_id: userId } })
      await db.UserAccess.destroy({ where: { user_id: userId } })
      logger.log('debug', `Deleted user, id: ${userId}`)
      return true
    } catch (err) {
      logger.log('warn', `Error deleting user: ${err}`)
      return false
    }
  },
  // Check if a valid username and password is provided and return a JWT if so
  async login(email, password) {
    const user = await db.User.findOne({
      where: {
        email: email
      }
    })
    if (user) {
      logger.log('debug', `Attempting to login user: ${user.email}`)
      // Check if the account is locked
      if (user.locked) {
        logger.log('error', 'User tried to log into locked account')
        return {
          status: 401,
          data: {
            msg:
              'This account is locked, please contact the system administrator for assistance.'
          }
        }
      }
      // Verify the password
      if (bcrypt.compareSync(password, user.password)) {
        // Password correct, create JWT token
        const token = jwt.sign(user.dataValues, process.env.APP_KEY, {
          expiresIn: '12h'
        })
        // Update the last logged in field for the user
        await user.updateAttributes({
          last_login: db.sequelize.fn('NOW'),
          login_attempts: 0
        })
        return { status: 200, data: { token: token }, user }
      } else {
        // Invalid password given, add the bad login attempt to the database
        await user.increment('login_attempts')
        logger.log('warn', 'Invalid password attempt')
        if (user.login_attempts >= 5) {
          await user.updateAttributes({
            locked: 1
          })
          logger.log('error', 'Account now locked from too many login attempts')
          return {
            status: 401,
            data: {
              msg:
                'Account is locked due to too many login attempts, please contact system administrator for assistance.'
            }
          }
        } else {
          return {
            status: 401,
            data: {
              msg:
                'Invalid email and/or password. Upon 5 incorrect logins the account will be locked.'
            }
          }
        }
      }
    } else {
      logger.log('error', `Login attempt unsuccessful: ${email}`)
      return {
        status: 401,
        data: {
          msg:
            'Invalid email and/or password. Upon 5 incorrect logins the account will be locked.'
        }
      }
    }
  },
  // Simple verification of the token sent in the auth header
  // Also retrieves information about the user that the portal uses for rendering
  async verifyAuth(user) {
    // Get the user's config values and add that to the user object
    const userConfigResult = await db.UserConfig.findAll({
      where: { user_id: user.id }
    })
    const userConfig = {}
    for (let option of userConfigResult) {
      userConfig[option.key] = parseInt(option.value) === 1 ? true : false
    }
    // Get the user's access values and add that to the user object
    const userAccessResult = await db.UserAccess.findAll({
      where: { user_id: user.id }
    })
    const userAccess = {}
    for (let access of userAccessResult) {
      userAccess[access.key] = parseInt(access.value)
    }
    // Get the apps submitted by the user
    const androidAppsSubmitted = await db.AnalyzedApp.count({
      where: { user_id: user.id },
      include: [{ model: db.FarmApp, where: { platform: 'android' } }]
    })
    const iosAppsSubmitted = await db.AnalyzedApp.count({
      where: { user_id: user.id },
      include: [{ model: db.FarmApp, where: { platform: 'ios' } }]
    })
    return {
      status: 200,
      data: {
        email: user.email,
        config: userConfig,
        access: userAccess,
        androidSubmissions: androidAppsSubmitted,
        iosSubmissions: iosAppsSubmitted
      }
    }
  },
  // Get a listing of pages the user has access to
  async getPages(user) {
    logger.log('debug', `Getting list of pages user has access to: ${user}`)
    const pages = await db.UserPage.findAll({
      attributes: ['nav_json'],
      where: {
        user_id: user.id,
        enabled: 1
      },
      order: [['order', 'ASC']]
    })
    const navJson = []
    for (let page of pages) {
      navJson.push(page.nav_json)
    }
    return {
      status: 200,
      data: navJson
    }
  },
  // Attempt to change the user's password
  async changePassword(user, currentPass, newPass) {
    if (bcrypt.compareSync(currentPass, user.password)) {
      // Check for password minimums
      const passTestResult = owasp.test(newPass)
      if (!passTestResult.strong) {
        logger.log(
          'error',
          `Invalid new password entered: ${user.email}, errors: ${
            passTestResult.errors
          }`
        )
        return {
          status: 400,
          data: {
            msg: 'Invalid new password',
            errors: passTestResult.errors
          }
        }
      }
      // If the user provided the correct password, and their new password meets the
      // minimum requirements, update their user record with the new password
      const userRecord = await db.User.findOne({
        where: { email: user.email }
      })
      await userRecord.updateAttributes({
        password: bcrypt.hashSync(newPass, 10)
      })
      return { status: 200, data: { success: true } }
    } else {
      logger.warn('debug', 'Incorrect password given during password change')
      return {
        status: 400,
        data: {
          success: false,
          msg: 'Incorrect password'
        }
      }
    }
  },
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
