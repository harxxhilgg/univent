import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventsByUser,
} from "../controllers/eventController";

const router = express.Router();

router.post("/create", createEvent as any);

router.get("/getAllEvents", getAllEvents);

router.get("/user/:email", getEventsByUser);

export default router;
