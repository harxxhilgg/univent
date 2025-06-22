import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../components/useToast";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { api } from "../utils/api";
import { cleanupOldNotifications, initializeBackgroundTask } from "../utils/notificationScheduler";

interface ProviderProps {
  children?: React.ReactNode;
};

export function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  };
};

const requestNotificationPermission = async () => {
  try {
    if (!Device.isDevice) {
      console.log('Skipping notification permission');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('User did not grant notification permission');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to request notification permission: ', err);
    return false;
  };
};

export const UserProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Auth' | 'Main'>('Auth');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    async function initializeApp() {
      try {
        await requestNotificationPermission();
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decodedPayload = decodeJwtPayload(token);
          if (decodedPayload) {
            setUser(decodedPayload);
            setInitialRoute('Main');

            if (!hasShownWelcome) {
              setHasShownWelcome(true);
              if (decodedPayload.email === "user.guest@univent.com") {
                showInfo(3000, 'Welcome to Univent', 'You are using a guest account');
              } else {
                showSuccess(3000, 'Welcome back', `Hello, ${decodedPayload.username}`);
              }
            }

            await registerForPushNotifications(token, decodedPayload);

            await initializeBackgroundTask();
            await cleanupOldNotifications();

          } else {
            setInitialRoute('Auth');
          }
        } else {
          setInitialRoute('Auth');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setInitialRoute('Auth');
      } finally {
        setIsLoading(false);
      }
    }

    async function registerForPushNotifications(token: string, userData?: any) {
      try {
        if (!Device.isDevice) {
          console.log('Skipping token registration');
          return;
        }

        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission not granted, skipping token registration.');
          return;
        }

        const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();

        if (expoPushToken) {
          console.log('Push token obtained: ', expoPushToken);

          const userEmail = userData?.email || user?.email;

          if (!userEmail) {
            console.error('User email not found - cannot register push token');
            return;
          }

          const response = await api.post("/default/notification-push-token", {
            expoPushToken,
            userEmail
          });
          if (response.status === 200) {
            console.log('Push token registered with server: ', response.data);
          } else {
            console.error('Failed to register push token: ', response.data);
          }
        }
      } catch (err) {
        console.error("Error registering push token: ", err);
      }
    }

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, initialRoute }}>
      {children}
    </UserContext.Provider>
  );
};
