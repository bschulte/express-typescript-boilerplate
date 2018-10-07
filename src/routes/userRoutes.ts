import { Request, Response, Router } from "express";

import { createUser, getUser } from "../controllers/userController";

const router: Router = Router();

// Get user by ID
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await getUser(userId);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
  }
});

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

export const userRouter: Router = router;
