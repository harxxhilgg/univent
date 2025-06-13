import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import dotenv from "dotenv";

dotenv.config();

export const notificationPushToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    const decoded = jwt.verify(token, jwtSecret);
    // @ts-ignore
    const userId = decoded.userId;
    const { expoPushToken } = req.body;

    if (!expoPushToken) {
      return res.status(400).json({ error: "Expo push token is required" });
    }

    await pool.query(
      `
      UPDATE
        users
      SET
        expo_push_token = $1
      WHERE
        id = $2     
      `,
      [expoPushToken, userId]
    );

    res.status(200).json({ message: "Push token registered succesfully" });
  } catch (err) {
    console.error("Failed to register push token: ", err);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
