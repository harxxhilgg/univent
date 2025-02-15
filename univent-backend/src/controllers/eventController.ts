import { Request, Response } from "express";
import pool from "../config/db";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      organizer,
      event_date,
      event_time,
      location,
      image_url,
      is_paid,
    } = req.body;

    if (
      !title ||
      !organizer ||
      !event_date ||
      !event_time ||
      !location ||
      !is_paid
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
      WHERE title = $1;
      `,
      [title]
    );
    if (eventExists.rows.length > 0) {
      return res.status(400).json({ message: "Event already exists" });
    }

    // create event
    const result = await pool.query(
      `
      INSERT INTO
        events (title, organizer, event_date, event_time, location, image_url, is_paid)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [title, organizer, event_date, event_time, location, image_url, is_paid]
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
