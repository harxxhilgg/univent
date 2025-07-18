import cron from "node-cron";
import pool from "../config/db";
import logger from "../utils/logger";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

const sendEventReminders = async () => {
  try {
    const reminderQuery = `
      SELECT
        id, title
      FROM
        events
      WHERE
        (event_date + event_time) AT TIME ZONE 'Asia/Kolkata'
        BETWEEN NOW() + interval '9 minutes' AND NOW() + interval '11 minutes'
      AND
        reminder_sent = FALSE
    `;
    const upcomingEvents = await pool.query(reminderQuery);

    if (upcomingEvents.rows.length > 0) {
      const usersResult = await pool.query(`
        SELECT
          expo_push_token
        FROM
          users
        WHERE
          expo_push_token
          IS NOT NULL
      `);

      const pushTokens = usersResult.rows
        .map((user) => user.expo_push_token)
        .filter((token) => Expo.isExpoPushToken(token));

      if (pushTokens.length > 0) {
        const messages = [];
        const eventIdsToUpdate = [];

        for (const event of upcomingEvents.rows) {
          eventIdsToUpdate.push(event.id);
          for (const pushToken of pushTokens) {
            messages.push({
              to: pushToken,
              sound: "default" as const,
              title: "Event Starting Soon!",
              body: `"${event.title}" starts in about 10 minutes!`,
              data: { eventId: event.id, ...event },
            });
          }
        }
        const chunks = expo.chunkPushNotifications(messages);

        for (const chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }

        await pool.query(
          `
          UPDATE
            events
          SET
            reminder_sent = TRUE
          WHERE
            id = ANY($1::int[])
          `,
          [eventIdsToUpdate]
        );
        logger.debug(
          `[CRON] Sent 10-min reminder for ${upcomingEvents.rows.length} event(s) to ${pushTokens.length} users.`
        );
      }
    }

    const startingNowQuery = `
      SELECT
        id, title
      FROM
        events
      WHERE
        (event_date + event_time) AT TIME ZONE 'Asia/Kolkata'
        BETWEEN NOW() - interval '1 minute' AND NOW() + interval '1 minute'
      AND
        starting_now_sent = FALSE
    `;
    const startingNowEvents = await pool.query(startingNowQuery);

    if (startingNowEvents.rows.length > 0) {
      const usersResult = await pool.query(`
        SELECT
          expo_push_token
        FROM
          users
        WHERE
          expo_push_token
          IS NOT NULL
        `);
      const pushTokens = usersResult.rows
        .map((user) => user.expo_push_token)
        .filter((token) => Expo.isExpoPushToken(token));

      if (pushTokens.length > 0) {
        const messages = [];
        const eventIdsToUpdate = [];

        for (const event of startingNowEvents.rows) {
          eventIdsToUpdate.push(event.id);
          for (const pushToken of pushTokens) {
            messages.push({
              to: pushToken,
              sound: "default" as const,
              title: "Event Starting Now!",
              body: `"${event.title}" is starting right now!`,
              data: { eventId: event.id, ...event },
            });
          }
        }

        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }

        await pool.query(
          `
          UPDATE
            events
          SET
            starting_now_sent = TRUE
          WHERE
            id = ANY($1::int[])
          `,
          [eventIdsToUpdate]
        );
        logger.debug(
          `[CRON] Sent starting now reminder for ${startingNowEvents.rows.length} event(s) to ${pushTokens.length} users.`
        );
      }
    }
  } catch (error) {
    logger.error("[CRON] Error in notification cron job: ", error);
  }
};

export const startNotificationCronJob = () => {
  cron.schedule("* * * * *", sendEventReminders);
};
