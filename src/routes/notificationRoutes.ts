import { Request, Response, Router } from "express";

import {
  createNewNotification,
  updateNotificationStatus
} from "../controllers/notificationController";
import { authenticateUser, isAdmin } from "../middleware/authentication";

const router: Router = Router();

// Handle a bulk record upload
router.post(
  "/",
  authenticateUser,
  isAdmin,
  async (req: Request, res: Response) => {
    const { notificationHtml, title, userIds } = req.body;

    const success = await createNewNotification(
      notificationHtml,
      title,
      userIds
    );

    if (!success) {
      return res.status(500).json({ msg: "Error creating notification" });
    } else {
      return res.sendStatus(200);
    }
  }
);

export const notificationRouter: Router = router;
