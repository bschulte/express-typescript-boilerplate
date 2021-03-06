import { Request, Response, Router } from "express";

import {
  changePassword,
  createUser,
  deleteUser,
  getUser,
  login
} from "../controllers/userController";

import { User } from "../models";

import { authenticateUser, isAdmin } from "../middleware/authentication";

const router: Router = Router();

// Login a user
// Make sure to keep this before we declare the middleware since
// the login route obviously won't already be authenticated
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { status, data } = await login(email, password);

  return res.status(status).json(data);
});

// Middleware
router.use(authenticateUser);

// Simple route to verify if the user's provided API key/token is valid
router.get("/verify-auth", (req: Request, res: Response) => {
  return res.status(200).json({ email: res.locals.user.email });
});

// All of the following routes require admin rights
router.use(isAdmin);

// Create user
router.post("/", async (req: Request, res: Response) => {
  const { username, email } = req.body;
  const { successfullyCreatedUser, generatedPassword } = await createUser(
    username,
    email
  );

  if (successfullyCreatedUser) {
    return res.status(200).json({ success: true, generatedPassword });
  } else {
    return res.status(500).json({ success: false });
  }
});

// Get user by ID
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { user: authenticatedUser } = res.locals;
  const user: User = await getUser(userId, authenticatedUser);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
  }
});

// Update a user's password
router.put("/password", async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { currentPassword, newPassword } = req.query;

  const { status, data } = await changePassword(
    user,
    currentPassword,
    newPassword
  );

  return res.status(status).json(data);
});

// Delete a user
router.delete("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  const deleteWasSuccessful: boolean = await deleteUser(userId);

  if (deleteWasSuccessful) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(404).json({ success: false, msg: "Could not find user" });
  }
});

export const userRouter: Router = router;
