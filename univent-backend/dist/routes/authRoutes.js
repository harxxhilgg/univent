"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authValiation_1 = require("../middlewares/authValiation");
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.json({ message: "Auth route is working." });
});
router.post("/login", authValiation_1.validateLogin, authController_1.login);
router.post("/signup", authValiation_1.validateSignup, authController_1.signup);
router.delete("/deleteAccount", authController_1.deleteAccount);
router.put("/updateProfile", authController_1.updateProfile);
exports.default = router;
