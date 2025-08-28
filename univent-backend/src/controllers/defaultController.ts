import jwt from "jsonwebtoken";
import pool from "../config/db";
import dotenv from "dotenv";
import logger from "../utils/logger";
import { Request, Response } from "express";

dotenv.config();

export const getDefault = (req: Request, res: Response) => {
  res.json({ message: "default route is working" });
};

export const updatePushToken = async (req: Request, res: Response) => {
  try {
    const { expoPushToken, userEmail } = req.body;

    if (!expoPushToken) {
      return res
        .status(400)
        .json({ messge: "updateToken - expo Push token is required" });
    }

    if (!userEmail) {
      return res
        .status(400)
        .json({ message: "updateToken - user email is required" });
    }

    logger.debug(`updateToken - updating push token for user: ${userEmail}`);
    logger.debug(
      `updateToken - updated push token: ${expoPushToken.substring(0, 20)}...`
    );

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
      return res.status(404).json({ message: "updateToken - user not found" });
    }

    logger.debug(
      `updateToken - push token updated successfully for user: ${userEmail}`
    );

    res.json({
      message: "updateToken - push token updated successfully",
      email: userEmail,
      tokenUpdated: true,
    });
  } catch (error) {
    logger.error(`updateToken - error updating push token: ${error}`);
    res.status(500).json({
      message: "updateToken - server error while updating push token",
      error:
        error instanceof Error ? error.message : "updateToken - unknown error",
    });
  }
};

export const getPushToken = async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res
        .status(400)
        .json({ message: "getPushToken - user email is required" });
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
      return res.status(404).json({ message: "getPushToken - user not found" });
    }

    const user = result.rows[0];

    res.json({
      message: "getPushToken - push token retrieved successfully",
      email: user.email,
      hasPushToken: !!user.expo_push_token,
      pushToken: user.expo_push_token
        ? `${user.expo_push_token.substring(0, 20)}...`
        : null,
    });
  } catch (error) {
    logger.error(`getPushToken - error retrieving push token: ${error}`);
    res.status(500).json({
      message: "getPushToken - server error while retrieving push token",
    });
  }
};

export const notificationPushToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "notificationPushToken - unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res
        .status(500)
        .json({ error: "notificationPushToken - JWT secret not configured" });
    }

    const decoded = jwt.verify(token, jwtSecret);
    // @ts-ignore
    const { userId, email } = decoded;
    const { expoPushToken } = req.body;
    const start = expoPushToken.indexOf("[") + 1;
    const end = expoPushToken.indexOf("]");
    const justTheToken = expoPushToken.substring(start, end);

    if (!expoPushToken) {
      return res
        .status(400)
        .json({ error: "notificationPushToken - expo push token is required" });
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

    res.status(200).json({
      message: `notificationPushToken - token ${justTheToken} registered succesfully for ${email}`,
    });
  } catch (err) {
    logger.error(
      `notificationPushToken - failed to register push token: ${err}`
    );
    res
      .status(403)
      .json({ error: "notificationPushToken - invalid or expired token" });
  }
};
