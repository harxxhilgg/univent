import pool from "../config/db";
import logger from "../utils/logger";
import { Request, Response } from "express";
import { uploadToImgBB } from "../utils/imageUpload";

export const uploadImage = async (
  req: Request & { file?: Express.Multer.File },
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ imageUrl: null });
    }

    const imageUrl = await uploadToImgBB(
      req.file.buffer,
      req.file.originalname
    );
    logger.debug(`uploadImage - generated imgBB image URL: ${imageUrl}`);
    res.json({ imageUrl: imageUrl || null });
  } catch (err) {
    logger.error(`uploadImage - error uploading image to ImgBB: ${err}`);
    res.status(500).json({ imageUrl: null });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      organizer,
      eventDate,
      eventTime,
      location,
      imageUrl,
      isPaid,
      created_by_email,
    } = req.body;

    logger.debug(`
      Received event data:
      Title: ${title}
      Organizer: ${organizer}
      EventDate: ${eventDate}
      EventTime: ${eventTime}
      Location: ${location}
      ImageURL: ${imageUrl}
      IsPaid: ${isPaid}
      CreatedByEmail: ${created_by_email}
      `);

    if (
      !title ||
      !organizer ||
      !eventDate ||
      !eventTime ||
      !location ||
      !imageUrl ||
      !created_by_email ||
      !isPaid === undefined
    ) {
      return res
        .status(400)
        .json({ message: "createEvent - missing required fields" });
    }

    // event exists
    const eventExists = await pool.query(
      `
      SELECT
        1
      FROM
        events
      WHERE 
        title = $1
      AND
        created_by_email = $2
      `,
      [title, created_by_email]
    );
    if (eventExists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "createEvent - event already exists" });
    }

    // create event
    const result = await pool.query(
      `
      INSERT INTO
        events (title, organizer, event_date, event_time, location, image_url, is_paid, created_by_email)
      VALUES
        ($1, $2, $3::DATE, $4, $5, $6, $7, $8)
      RETURNING *;
      `,
      [
        title,
        organizer,
        eventDate,
        eventTime,
        location,
        imageUrl,
        isPaid,
        created_by_email,
      ]
    );

    res.status(201).json({
      message: "createEvent - event created successfully",
      event: result.rows[0],
    });
  } catch (error) {
    logger.error(`createEvent - error creating event: ${error}`);
    res.status(500).json({ message: "createEvent - server error" });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
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
      `
    );
    res.json(result.rows);
  } catch (err) {
    logger.error(`getAllEvents - error fetching on-going events: ${err}`);
    res.status(500).json({ message: "getAllEvents - server error" });
  }
};

export const getCurrentEvents = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
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
      `
    );
    res.json(result.rows);
  } catch (err) {
    logger.error(`getCurrentEvents - error fetching on-going events: ${err}`);
    res.status(500).json({ message: "getCurrentEvents - server error" });
  }
};

export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
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
      `
    );
    res.json(result.rows);
  } catch (error) {
    logger.error(`getUpcomingEvents - error fetching events: ${error}`);
    res.status(500).json({ message: "getUpcomingEvents - server error" });
  }
};

export const getEventsByUser = async (req: Request, res: Response) => {
  const { email } = req.params; // get email from url

  try {
    const result = await pool.query(
      `
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
      `,
      [email]
    );

    res.json(result.rows);
  } catch (err) {
    logger.error(`getEventsByUser - ${err}`);
    res.status(500).json({ message: "getEventsByUser - server error" });
  }
};

export const search = async (req: Request, res: Response) => {
  const { q } = req.query;

  try {
    const result = await pool.query(
      `
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
      `,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    logger.error(`search - ${err}`);
    res.status(500).json({ message: "search - server error" });
  }
};

export const getLatestEvent = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
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
        event_date + event_time::interval >= NOW()
      ORDER BY
        event_date ASC, event_time ASC
      LIMIT 1
      `
    );

    res.json(result.rows);
  } catch (err) {
    logger.error(`getLatestEvent - ${err}`);
    res.status(500).json({ message: "getLatestEvent - server error" });
  }
};
