import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "../components/useToast";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { api } from "../utils/api";

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

const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (!Device.isDevice) {
      console.log('Not a physical device');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification perms denied');
      return false;
    }

    console.log(`Notification perms granted`);
    return true;
  } catch (err) {
    console.error('Perms error: ', err);
    return false;
  };
};

export const UserProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Auth' | 'Main'>('Auth');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { showSuccess, showInfo } = useToast();

  async function registerForPushNotifications(token: string, userData?: any) {
    try {
      if (!Device.isDevice) {
        console.log('Skipping push token - not a physical device');
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notifications permission not granted - skipping token registration');
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
        };
      }
    } catch (error) {
      console.error('Error registering push token: ', error);
    };
  };

  useEffect(() => {
    async function initializeApp() {
      try {
        // req notification perms
        await requestNotificationPermission();

        // check existing auth token from storage
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decodedPayload = decodeJwtPayload(token);
          if (decodedPayload) {
            setUser(decodedPayload);
            setInitialRoute('Main');

            // welcome message
            if (!hasShownWelcome) {
              setHasShownWelcome(true);
              if (decodedPayload.email === "user.guest@univent.com") {
                showInfo(3000, 'Welcome to Univent', 'You are using a guest account');
              } else {
                showSuccess(3000, 'Welcome back', `Hello, ${decodedPayload.username}`);
              }
            }

            // register push token and initialize notifications
            await registerForPushNotifications(token, decodedPayload);

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

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, initialRoute }}>
      {children}
    </UserContext.Provider>
  );
};
