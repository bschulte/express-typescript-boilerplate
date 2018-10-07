import { Request, Response, Router } from "express";

const router: Router = Router();

// Test route
router.get("/", async (req: Request, res: Response) => {
  res.status(200).send("This is working!");
});

// Create route

export const userRouter: Router = router;
