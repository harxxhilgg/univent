import express from "express";
import { notificationPushToken } from "../controllers/defaultController";

const router = express.Router();

router.post("/notification-push-token", notificationPushToken as any);

export default router;
