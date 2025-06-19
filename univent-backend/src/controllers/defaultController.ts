import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import dotenv from "dotenv";

dotenv.config();

export const getDefault = (req: Request, res: Response) => {
  res.json({ message: "Default route is working" });
};

export const updatePushToken = async (req: Request, res: Response) => {
  try {
    const { expoPushToken, userEmail } = req.body;

    if (!expoPushToken) {
      return res.status(400).json({ messge: "Expo Push token is required" });
    }

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    console.log(`Updating push token for user: ${userEmail}`);
    console.log(`Updated push token: ${expoPushToken.substring(0, 20)}...`);

    const result = await pool.query(
      `
      UPDATE
        users
      SET
        expo_push_token = $1
      WHERE
        email = $2
      RETURNING
        email, expo_push_token
      `,
      [expoPushToken, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Push token updated successfully for user: ${userEmail}`);

    res.json({
      message: "Push token updated successfully",
      email: userEmail,
      tokenUpdated: true,
    });
  } catch (error) {
    console.error("Error updating push token: ", error);
    res.status(500).json({
      message: "Server error while updating push token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPushToken = async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    const result = await pool.query(
      `
      SELECT
        email, expo_push_token
      FROM
        users
      WHERE
        email = $1
      `,
      [userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      message: "Push token retrieved successfully",
      email: user.email,
      hasPushToken: !!user.expo_push_token,
      pushToken: user.expo_push_token
        ? `${user.expo_push_token.substring(0, 20)}...`
        : null,
    });
  } catch (error) {
    console.error("Error retrieving push token: ", error);
    res
      .status(500)
      .json({ message: "Server error while retrieving push token" });
  }
};

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
