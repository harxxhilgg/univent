import express from "express";
import {
  signup,
  login,
  deleteAccount,
  updateProfile,
  forgotPassword,
} from "../controllers/authController";
import { validateSignup, validateLogin } from "../middlewares/authValiation";
import { verifyToken } from "../middlewares/authMiddleware";
import rateLimit from "express-rate-limit";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes.",
  keyGenerator: (req, res) => {
    return req.body.email || req.ip;
  },
});

const updateProfileLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1,
  message:
    "You can only update your profile once per day. Please try again tomorrow.",
});

router.get("/", (req, res) => {
  res.json({ message: "Auth route is working." });
});

router.post("/login", loginLimiter, validateLogin as any, login as any);
router.post("/signup", validateSignup as any, signup as any);
router.delete("/deleteAccount", verifyToken as any, deleteAccount as any);
router.put(
  "/updateProfile",
  updateProfileLimiter,
  verifyToken as any,
  updateProfile as any
);
router.post("/forgotPassword", forgotPassword as any);

export default router;
