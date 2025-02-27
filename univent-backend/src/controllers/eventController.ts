import { Request, Response } from "express";
import { Express } from "express";
import pool from "../config/db";
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
    console.log("Generated imgBB image URL: ", imageUrl);
    res.json({ imageUrl: imageUrl || null });
  } catch (err) {
    console.error("Error uploading image to ImgBB: ", err);
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
      return res.status(400).json({ message: "Missing required fields" });
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
      return res.status(400).json({ message: "Event already exists" });
    }

    // create event
    const result = await pool.query(
      `
      INSERT INTO
        events (title, organizer, event_date, event_time, location, image_url, is_paid, created_by_email)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
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
      message: "Event created successfully",
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating event: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT
        *
      FROM
        events
      ORDER BY
        event_date ASC;
      `
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching events: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventsByUser = async (req: Request, res: Response) => {
  const { email } = req.params; // get email from url

  try {
    const result = await pool.query(
      `
      SELECT
        *
      FROM
        events
      WHERE
        created_by_email = $1
      ORDER BY
        event_date ASC;
      `,
      [email]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
