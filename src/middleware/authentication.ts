import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { User } from "../models";

import { DEBUG, ERROR, logger, WARN } from "../logging";

// Verify the user via the API key if its been provided in the request
// Returns the user object if it is found to match the given API key
const verifyApiKey = async (req: Request): Promise<null | User> => {
  let key;
  // Check in both the query string and request body for the API key
  if ("key" in req.query) {
    key = req.query.key;
  } else if ("key" in req.body) {
    key = req.body.key;
  } else {
    // User did not provide an API key so return null
    return null;
  }

  const user = await User.findOne({ where: { apiKey: key } });
  return user;
};

const verifyToken = async (req: Request): Promise<null | User> => {
  let authHeader: string = req.headers.authorization;

  // If the token was not provided in the headers, check the query string or request
  // body for the token
  if (!authHeader) {
    authHeader = req.query.token || req.body.token;
  }

  if (!authHeader) {
    return null;
  }

  authHeader = authHeader.split(" ")[1];
  let user = null;
  try {
    user = jwt.verify(authHeader, process.env.APP_KEY);
  } catch (err) {
    // This should be a debug message, since regularly JWTs will expire
    // during normal use of the portal so we don't want to raise alarms
    // when we can't verify it
    logger.log(DEBUG, `Error verifying JWT: ${err}`);
    return null;
  }

  return user;
};

// Use the two functions declared previously to attempt to validate the user either through
// JWT or API key. If authenticated, the user will be stored in res.locals.user for reference
// further in the call chain
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: () => void
): Promise<void | Response> => {
  // First try to verify via API key, then by token
  let user = await verifyApiKey(req);
  if (!user) {
    user = await verifyToken(req);
  }

  // This will mean that the user was not authenticated via either JWT or API key
  if (!user) {
    logger.log(
      DEBUG,
      `Could not verify user for path: ${req.baseUrl}/${req.path}`
    );

    logger.log(DEBUG, `Body params: ${JSON.stringify(req.body)}`);
    logger.log(DEBUG, `Query params: ${JSON.stringify(req.query)}`);

    return res.sendStatus(401);
  }

  res.locals.user = user;

  return next();
};

// Authenticate a user to view the API docs. We only want to perform the authentication on
// the first request, not the subsequent resource requests.
export const authenticateApiDocsUser = async (
  req: Request,
  res: Response,
  next: () => void
): Promise<void | Response> => {
  if (req.path === "/") {
    return authenticateUser(req, res, next);
  } else {
    return next();
  }
};

// Check if the authenticated user is an admin or not
export const isAdmin = async (
  req: Request,
  res: Response,
  next: () => void
): Promise<void | Response> => {
  const { user } = res.locals;

  if (!user.isAdmin) {
    logger.log(
      ERROR,
      `Non admin user ${user.email} tried to access admin route: ${
        req.originalUrl
      }`
    );
    return res.sendStatus(401);
  } else {
    return next();
  }
};
