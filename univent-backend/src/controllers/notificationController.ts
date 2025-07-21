import pool from "../config/db";
import logger from "../utils/logger";
import { Request, Response } from "express";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { userEmail, title, body, eventId, eventData } = req.body;

    if (!userEmail || !title || !body) {
      return res.status(400).json({
        message: "userEmail, title and body are required",
      });
    }

    logger.debug(`Sending notification to: ${userEmail}`);

    // getting user's push token from db
    const userResult = await pool.query(
      `
      SELECT
        expo_push_token
      FROM
        users
      WHERE
        email = $1 
      `,
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ messgae: "User not found" });
    }

    const pushToken = userResult.rows[0].expo_push_token;

    if (!pushToken) {
      return res.status(400).json({
        message: "User has no push token registered",
      });
    }

    logger.debug(`Using push token: ${pushToken.substring(0, 20)}...`);

    const message: any = {
      to: pushToken,
      sound: "default",
      title,
      body,
      data: {
        eventId: eventId?.toString() || "",
        ...eventData,
      },
    };

    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (let chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    res.json({
      message: "Notifications send successfully",
      messageId: tickets,
      recipient: userEmail,
    });
  } catch (error) {
    logger.error(`Error sending notifications: ${error}`);
    res.status(500).json({
      message: "Failed to send notification",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
