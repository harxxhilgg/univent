"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const eventController_1 = require("../controllers/eventController");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.get("/", (req, res) => {
    res.json({ message: "Event route is working." });
});
router.post("/upload", upload.single("image"), eventController_1.uploadImage);
router.post("/create", eventController_1.createEvent);
router.get("/getAllEvents", eventController_1.getAllEvents);
router.get("/getUpcomingEvents", eventController_1.getUpcomingEvents);
router.get("/user/:email", eventController_1.getEventsByUser);
router.get("/search", eventController_1.search);
router.get("/getLatestEvent", eventController_1.getLatestEvent);
router.get("/getCurrentEvents", eventController_1.getCurrentEvents);
exports.default = router;
