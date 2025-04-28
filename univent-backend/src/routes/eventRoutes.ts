import express from "express";
import multer from "multer";
import {
  createEvent,
  getUpcomingEvents,
  getEventsByUser,
  uploadImage,
  search,
  getLatestEvent,
  getCurrentEvents,
  getAllEvents,
} from "../controllers/eventController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", (req, res) => {
  res.json({ message: "Event route is working." });
});

router.post(
  "/upload",
  upload.single("image"),
  uploadImage as express.RequestHandler
);
router.post("/create", createEvent as any);
router.get("/getAllEvents", getAllEvents);
router.get("/getUpcomingEvents", getUpcomingEvents);
router.get("/user/:email", getEventsByUser);
router.get("/search", search);
router.get("/getLatestEvent", getLatestEvent);
router.get("/getCurrentEvents", getCurrentEvents);

export default router;
