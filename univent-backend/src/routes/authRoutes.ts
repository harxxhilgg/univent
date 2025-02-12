import express from "express";
import { signup, login } from "../controllers/authController";
import { validateSignup, validateLogin } from "../middlewares/authValiation";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth API is working!" });
});

router.post("/login", validateLogin as any, login as any);
router.post("/signup", validateSignup as any, signup as any);

export default router;
