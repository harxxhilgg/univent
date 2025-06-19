import express from "express";
import {
  getPushToken,
  notificationPushToken,
} from "../controllers/defaultController";

const router = express.Router();

router.post("/notification-push-token", notificationPushToken as any);
router.get("/notification-push-token", getPushToken as any);

export default router;
