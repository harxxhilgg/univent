import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { api } from "./api";

const isDev = __DEV__;

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!Device.isDevice) {
      if (isDev) console.log("emulator - skip notification perms");
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      if (isDev) console.log("notification perms denied");
      return false;
    }

    if (isDev) console.log(`notification perms granted`);
    return true;
  } catch (err) {
    console.error("notification perms error: ", err);
    return false;
  }
};

export const registerForPushNotifications = async (
  token: string,
  decodedPayload?: any
) => {
  try {
    if (!Device.isDevice) {
      if (isDev) console.log(`emulator - skip notification push token`);
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      if (isDev) console.log(`notifications perms: ${status}`);
      return;
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();

    if (expoPushToken) {
      if (isDev) console.log(`push token obtained: ${expoPushToken}`);

      const userEmail = decodedPayload?.email;

      if (!userEmail) {
        console.error(`user email not foound - cannot register push token`);
        return;
      }

      const response = await api.post("/default/notification-push-token", {
        expoPushToken,
        userEmail,
      });

      if (response.status === 200) {
        if (isDev)
          console.log(
            `push token registered with server: ${JSON.stringify(response.data)}`
          );
      } else {
        console.error(
          `failed to register push token: ${JSON.stringify(response.data)}`
        );
      }
    }
  } catch (error) {
    console.error(`error registering push token: ${error}`);
  }
};
