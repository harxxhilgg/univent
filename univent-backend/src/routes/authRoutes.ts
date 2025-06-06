import express from "express";
import {
  signup,
  login,
  deleteAccount,
  updateProfile,
  forgotPassword,
} from "../controllers/authController";
import { validateSignup, validateLogin } from "../middlewares/authValiation";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth route is working." });
});

router.post("/login", validateLogin as any, login as any);
router.post("/signup", validateSignup as any, signup as any);
router.delete("/deleteAccount", deleteAccount as any);
router.put("/updateProfile", updateProfile as any);
router.post("/forgotPassword", forgotPassword as any);

export default router;
