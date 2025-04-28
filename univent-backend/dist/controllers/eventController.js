"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestEvent = exports.search = exports.getEventsByUser = exports.getUpcomingEvents = exports.getCurrentEvents = exports.getAllEvents = exports.createEvent = exports.uploadImage = void 0;
const db_1 = __importDefault(require("../config/db"));
const imageUpload_1 = require("../utils/imageUpload");
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ imageUrl: null });
        }
        const imageUrl = yield (0, imageUpload_1.uploadToImgBB)(req.file.buffer, req.file.originalname);
        console.log("Generated imgBB image URL: ", imageUrl);
        res.json({ imageUrl: imageUrl || null });
    }
    catch (err) {
        console.error("Error uploading image to ImgBB: ", err);
        res.status(500).json({ imageUrl: null });
    }
});
exports.uploadImage = uploadImage;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, organizer, eventDate, eventTime, location, imageUrl, isPaid, created_by_email, } = req.body;
        console.log("Received event data: ", {
            title,
            organizer,
            eventDate,
            eventTime,
            location,
            imageUrl,
            isPaid,
            created_by_email,
        });
        if (!title ||
            !organizer ||
            !eventDate ||
            !eventTime ||
            !location ||
            !imageUrl ||
            !created_by_email ||
            !isPaid === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // event exists
        const eventExists = yield db_1.default.query(`
      SELECT
        1
      FROM
        events
      WHERE 
        title = $1
      AND
        created_by_email = $2
      `, [title, created_by_email]);
        if (eventExists.rows.length > 0) {
            return res.status(400).json({ message: "Event already exists" });
        }
        // create event
        const result = yield db_1.default.query(`
      INSERT INTO
        events (title, organizer, event_date, event_time, location, image_url, is_paid, created_by_email)
      VALUES
        ($1, $2, $3::DATE, $4, $5, $6, $7, $8)
      RETURNING *;
      `, [
            title,
            organizer,
            eventDate,
            eventTime,
            location,
            imageUrl,
            isPaid,
            created_by_email,
        ]);
        res.status(201).json({
            message: "Event created successfully",
            event: result.rows[0],
        });
    }
    catch (error) {
        console.error("Error creating event: ", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createEvent = createEvent;
const getAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT
        id,
        title,
        organizer,
        event_date::TEXT AS event_date, -- ensuring returned as plain text, no time conversions.
        event_time,
        location,
        image_url,
        is_paid,
        created_by_email
      FROM
        events
      ORDER BY
        event_date ASC,
        event_time ASC;
      `);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Error fetching on-going events: ", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getAllEvents = getAllEvents;
const getCurrentEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT
        id,
        title,
        organizer,
        event_date::TEXT AS event_date, -- ensuring returned as plain text, no time conversions.
        event_time,
        location,
        image_url,
        is_paid,
        created_by_email
      FROM
        events
      WHERE
        (event_date + event_time)::timestamp BETWEEN NOW() - INTERVAL '2 hours' AND NOW()
      ORDER BY
        event_date ASC,
        event_time ASC;
      `);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Error fetching on-going events: ", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getCurrentEvents = getCurrentEvents;
const getUpcomingEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT
        id,
        title,
        organizer,
        event_date::TEXT AS event_date, -- ensuring returned as plain text, no time conversions.
        event_time,
        location,
        image_url,
        is_paid,
        created_by_email
      FROM
        events
      WHERE
        (event_date + event_time)::timestamp >= NOW()
      ORDER BY
        event_date ASC,
        event_time ASC;
      `);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching events: ", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getUpcomingEvents = getUpcomingEvents;
const getEventsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params; // get email from url
    try {
        const result = yield db_1.default.query(`
      SELECT
        id,
        title,
        organizer,
        event_date::TEXT AS event_date, -- ensuring returned as plain text, no time conversions.
        event_time,
        location,
        image_url,
        is_paid,
        created_by_email
      FROM
        events
      WHERE
        created_by_email = $1
        AND (event_date + event_time::interval) >= NOW()
      ORDER BY
        event_date ASC, event_time ASC;
      `, [email]);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getEventsByUser = getEventsByUser;
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { q } = req.query;
    try {
        const result = yield db_1.default.query(`
      SELECT
        id,
        title,
        organizer,
        event_date::TEXT AS event_date, -- ensuring returned as plain text, no time conversions.
        event_time,
        location,
        image_url,
        is_paid,
        created_by_email
      FROM
        events
      WHERE
        title ILIKE $1
        AND (event_date + event_time::interval) >= NOW()
      ORDER BY
        event_date ASC, event_time ASC;
      `, [`%${q}%`]);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.search = search;
const getLatestEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT
        title,
        event_date::TEXT AS event_date, -- ensuring returned as plain text, no time conversions.
        event_time
      FROM
        events
      WHERE
        event_date + event_time::interval >= NOW()
      ORDER BY
        event_date ASC, event_time ASC
      LIMIT 1
      `);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getLatestEvent = getLatestEvent;
