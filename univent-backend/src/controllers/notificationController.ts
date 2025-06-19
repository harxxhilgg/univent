import { Request, Response } from "express";
import { messaging } from "../config/firebase";
import { Expo } from "expo-server-sdk";
import pool from "../config/db";

const expo = new Expo();

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { userEmail, title, body, eventId, screen, eventData } = req.body;

    if (!userEmail || !title || !body) {
      return res.status(400).json({
        message: "userEmail, title and body are required",
      });
    }

    console.log(`Sending notification to: ${userEmail}`);

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

    console.log(`Using push token: ${pushToken.substring(0, 20)}...`);

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Invalid Expo push token: ${pushToken}`);
      return res.status(400).json({
        message: "Invalid Expo push token",
      });
    }

    const message: any = {
      to: pushToken,
      sound: "default",
      title,
      body,
      data: {},
    };

    if (eventId) {
      message.data.eventId = eventId.toString();

      if (eventData) {
        message.data = {
          ...message.data,
          title: eventData.title,
          organizer: eventData.organizer,
          event_date: eventData.event_date,
          event_time: eventData.event_time,
          location: eventData.location,
          image_url: eventData.image_url,
          is_paid: eventData.is_paid,
          created_by_email: eventData.created_by_email || "",
          created_at: eventData.created_at || new Date().toISOString(),
        };
      }
    }

    if (screen) {
      message.data.screen = screen;
    }

    console.log(`Sending notificaiton message: `, {
      to: `${pushToken.substring(0, 20)}...`,
      title,
      body,
      data: message.data,
    });

    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(`Received tickets: `, ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification chunk: ", error);
        throw error;
      }
    }

    console.log(`Successfully sent notification to ${userEmail}`);

    res.json({
      message: "Notification sent successfully",
      messageId: tickets,
      recipient: userEmail,
    });
  } catch (error) {
    console.error("Error sending notification: ", error);
    res.status(500).json({
      message: "Failed to send notification",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: "userEmail is required" });
    }

    const testNotificationData = {
      userEmail,
      title: "🎉 New Event Near You!",
      body: "Check out 'React Native Conference 2025",
      eventId: "123",
      eventData: {
        title: "React Native Conference 2025",
        organizer: "Tech Community",
        event_date: "2025-12-01",
        event_time: "14:30:00",
        location: "San Francisco, CA",
        image_url:
          "https://i.pinimg.com/736x/f9/d4/55/f9d4557138ebed85e384e9d37d3ec194.jpg",
        is_paid: "false",
      },
    };

    return await sendNotification(
      { ...req, body: testNotificationData } as Request,
      res
    );
  } catch (error) {
    console.error("Error sending test notification: ", error);
    res.status(500).json({ message: "Failed to send test notification" });
  }
};
