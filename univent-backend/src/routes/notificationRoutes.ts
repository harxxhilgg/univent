import express from "express";
import {
  sendNotification,
  sendTestNotification,
} from "../controllers/notificationController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Notification route is working" });
});

router.post("/send", verifyToken as any, sendNotification as any);
router.post("/test", verifyToken as any, sendTestNotification as any);

export default router;
