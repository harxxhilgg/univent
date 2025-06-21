import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import { AppState } from "react-native";

const ANDROID_CHANNEL_ID = "event-reminders";
const BACKGROUND_TASK_NAME = "background-notification-check";
const SCHEDULED_NOTIFICATIONS_KEY = "scheduled_notifications";
const LAST_CHECK_KEY = "last_notification_check";

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  console.log("Background task running...");

  try {
    await checkAndScheduleNotifications();
    return { success: true };
  } catch (error) {
    console.error("Background task error: ", error);
    return { success: false };
  }
});

export const checkAndScheduleNotifications = async () => {
  try {
    await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());

    const response = await api.get("/events/getLatestEvent");
    const events = response.data;

    if (!Array.isArray(events) || events.length === 0) {
      console.log("No upcoming events found");
      return;
    }

    const event = events[0];
    console.log(`Latest event: ${event.title}`);

    const eventDateTime = new Date(`${event.event_date}T${event.event_time}`);
    const now = new Date();

    const reminderTime = new Date(eventDateTime.getTime() - 10 * 60 * 1000);
    const startTime = new Date(eventDateTime.getTime());

    console.log(`Event time: ${eventDateTime.toLocaleString()}`);
    console.log(`10min reminder: ${reminderTime.toLocaleString()}`);
    console.log(`Start notification: ${startTime.toLocaleString()}`);

    await scheduleEventNotifications(event, reminderTime, startTime, now);
  } catch (error) {
    console.error("Error checking events for notifications: ", error);
  }
};

const scheduleEventNotifications = async (
  event: any,
  reminderTime: Date,
  startTime: Date,
  now: Date
) => {
  try {
    const scheduledStr = await AsyncStorage.getItem(
      SCHEDULED_NOTIFICATIONS_KEY
    );
    const scheduled = scheduledStr ? JSON.parse(scheduledStr) : {};
    const eventKey = `event_${event.id}`;

    if (scheduled[eventKey]) {
      console.log(`Notifications already scheduled for event: ${event.title}`);
      return;
    }

    const notifications = [];

    if (reminderTime > now) {
      const reminderNotificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "⏰ Event Starting Soon!",
            body: `"${event.title}" starts in 10 minutes!`,
            data: {
              type: "reminder",
              eventId: event.id.toString(),
              title: event.title,
              organizer: event.organizer,
              event_date: event.event_date,
              event_time: event.event_time,
              location: event.location,
              image_url: event.image_url,
              is_paid: event.is_paid.toString(),
              created_by_email: event.created_by_email,
              created_at: event.created_at || new Date().toISOString(),
            },
            sound: "default",
          },
          trigger: {
            date: reminderTime,
            channelId: ANDROID_CHANNEL_ID,
          },
        });

      notifications.push({
        id: reminderNotificationId,
        type: "reminder",
        scheduledFor: reminderTime.toISOString(),
        minutesBefore: 10,
      });

      console.log(
        `Scheduled 10-min reminder for ${reminderTime.toLocaleString()}`
      );
    } else {
      console.log(`10-min reminder time has passed for: ${event.title}`);
    }

    if (startTime > now) {
      const startNotificationId = await Notifications.scheduleNotificationAsync(
        {
          content: {
            title: "🎉 Event Starting Now!",
            body: `"${event.title}" is starting right now! Don't miss it!`,
            data: {
              type: "start",
              eventId: event.id.toString(),
              title: event.title,
              organizer: event.organizer,
              event_date: event.event_date,
              event_time: event.event_time,
              location: event.location,
              image_url: event.image_url,
              is_paid: event.is_paid.toString(),
              created_by_email: event.created_by_email,
              created_at: event.created_at || new Date().toISOString(),
            },
            sound: "default",
          },
          trigger: {
            date: startTime,
            channelId: ANDROID_CHANNEL_ID,
          },
        }
      );

      notifications.push({
        id: startNotificationId,
        type: "start",
        scheduledFor: startTime.toISOString(),
        minutesBefore: 0,
      });

      console.log(
        `📱 Scheduled start notification for: ${startTime.toLocaleString()}`
      );
    } else {
      console.log(`⏭️ Event start time has passed for: ${event.title}`);
    }

    if (notifications.length > 0) {
      scheduled[eventKey] = {
        eventId: event.id,
        eventTitle: event.title,
        eventDateTime: startTime.toISOString(),
        notifications: notifications,
        scheduledAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        SCHEDULED_NOTIFICATIONS_KEY,
        JSON.stringify(scheduled)
      );
      console.log(
        `Saved ${notifications.length} scheduled notifications for: ${event.title}`
      );
    } else {
      console.log(
        `No notifications scheduled for: ${event.title} (times have passed)`
      );
    }
  } catch (error) {
    console.error("Error scheduling notifications: ", error);
  }
};

export const initializeBackgroundTask = async () => {
  try {
    console.log("Initializing notification system...");

    AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        console.log("App became available, checking for notifications...");
        await checkAndScheduleNotifications();
      }
    });

    await checkAndScheduleNotifications();

    console.log("Notification system intialized successfully");
  } catch (error) {
    console.error("Failed to register background fetch:", error);
  }
};

export const cleanupOldNotifications = async () => {
  try {
    const scheduledStr = await AsyncStorage.getItem(
      SCHEDULED_NOTIFICATIONS_KEY
    );
    if (!scheduledStr) return;

    const scheduled = JSON.parse(scheduledStr);
    const now = new Date();
    const updatedScheduled: { [key: string]: any } = {};

    for (const [eventKey, data] of Object.entries(scheduled)) {
      const eventData = data as any;
      const eventDateTime = new Date(eventData.eventDateTime);
      const eventEndBuffer = new Date(eventDateTime.getTime() + 60 * 60 * 1000);

      if (eventEndBuffer > now) {
        updatedScheduled[eventKey] = eventData;
      } else {
        for (const notif of eventData.notifications) {
          try {
            await Notifications.cancelScheduledNotificationAsync(notif.id);
          } catch (error) {
            console.log("Error canceling notification:", error);
          }
        }
        console.log(
          `🗑️ Cleaned up expired notifications for: ${eventData.eventTitle}`
        );
      }
    }

    await AsyncStorage.setItem(
      SCHEDULED_NOTIFICATIONS_KEY,
      JSON.stringify(updatedScheduled)
    );
    console.log("🧹 Cleaned up old notifications");
  } catch (error) {
    console.error("❌ Error cleaning up notifications:", error);
  }
};

export const scheduleTestNotifications = async () => {
  const now = new Date();
  const testReminderTime = new Date(now.getTime() + 10000);
  const testStartTime = new Date(now.getTime() + 20000);

  const reminderId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🧪 Test 10-Minute Reminder",
      body: "This simulates a 10-minute reminder notification!",
      data: { type: "test-reminder" },
    },
    trigger: {
      date: testReminderTime,
      channelId: ANDROID_CHANNEL_ID,
    },
  });

  const startId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🧪 Test Event Start",
      body: "This simulates an event starting notification!",
      data: { type: "test-start" },
    },
    trigger: {
      date: testStartTime,
      channelId: ANDROID_CHANNEL_ID,
    },
  });

  console.log(`🧪 Test notifications scheduled:`);
  console.log(
    `📢 Reminder in 10 seconds: ${testReminderTime.toLocaleString()}`
  );
  console.log(`🎉 Start in 20 seconds: ${testStartTime.toLocaleString()}`);

  return { reminderId, startId };
};

export const getScheduledNotifications = async () => {
  try {
    const scheduledStr = await AsyncStorage.getItem(
      SCHEDULED_NOTIFICATIONS_KEY
    );
    const scheduled = scheduledStr ? JSON.parse(scheduledStr) : {};

    console.log("📋 Currently scheduled notifications:");
    Object.entries(scheduled).forEach(([key, data]: [string, any]) => {
      console.log(
        `- ${data.eventTitle}: ${data.notifications.length} notifications`
      );
      data.notifications.forEach((notif: any) => {
        console.log(
          `  ${notif.type}: ${new Date(notif.scheduledFor).toLocaleString()}`
        );
      });
    });

    return scheduled;
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return {};
  }
};
