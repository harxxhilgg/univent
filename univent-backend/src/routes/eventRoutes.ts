import express from "express";
import multer from "multer";
import {
  createEvent,
  getAllEvents,
  getEventsByUser,
  uploadImage,
  search,
  getLatestEvent,
} from "../controllers/eventController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload",
  upload.single("image"),
  uploadImage as express.RequestHandler
);
router.post("/create", createEvent as any);
router.get("/getAllEvents", getAllEvents);
router.get("/user/:email", getEventsByUser);
router.get("/search", search);
router.get("/getLatestEvent", getLatestEvent);

export default router;
