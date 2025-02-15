import express from "express";
import { createEvent, getAllEvents } from "../controllers/eventController";

const router = express.Router();

router.post("/create", createEvent as any);

router.get("/events", getAllEvents as any);

export default router;
