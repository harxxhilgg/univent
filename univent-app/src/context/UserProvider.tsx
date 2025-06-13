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

export const UserProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Auth' | 'Main'>('Auth');
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    async function checkAuth() {
      const timeout = setTimeout(() => {
        if (isLoading) {
          showInfo(2500, "Authentication timed out!", "Please try again.");
          setInitialRoute('Auth');
          setIsLoading(false);
        }
      }, 5000);

      try {
        const authToken = await AsyncStorage.getItem('authToken');

        if (authToken) {
          const decoded = decodeJwtPayload(authToken);

          if (decoded && decoded.userId && decoded.username && decoded.email) {
            const currentTime = Math.floor(Date.now() / 1000);

            if (decoded.exp && decoded.exp < currentTime) {
              await AsyncStorage.removeItem('authToken');
              showInfo(3000, 'Session Expired!', 'Please login again.');
              setInitialRoute('Auth');
            } else {
              setUser({
                id: decoded.userId,
                username: decoded.username,
                email: decoded.email
              });
              // console.log(`session found, token expires in ${currentTime}/${decoded.exp}`); // ! DEBUG ONLY
              showSuccess(1500, 'Welcome back!');
              setInitialRoute('Main');
            }
          } else {
            await AsyncStorage.removeItem('authToken');
            setInitialRoute('Auth');
          }
        } else {
          setInitialRoute('Auth');
        }
      } catch (err) {
        console.error('Error checking auth: ', err);
        setInitialRoute('Auth');
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    }

    checkAuth().catch((err) => console.error('check auth failed: ', err));
  }, [isLoading, showInfo, showSuccess]);

  useEffect(() => {
    if (!user) return;

    const registerForPushNotification = async () => {
      try {
        if (!Device.isDevice) {
          console.log('Push notifications only work on physical devices');
          return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Notification permission not granted');
          return;
        }

        const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();

        console.log("Expo push token: ", expoPushToken);

        const token = await AsyncStorage.getItem("authToken");

        if (!token) return;

        await api.post("/default/notification-push-token",
          { expoPushToken },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Push token registered with server: ", expoPushToken);
      } catch (err) {
        console.error("Error registering push token: ", err);
      };
    };

    registerForPushNotification();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, initialRoute }}>
      {children}
    </UserContext.Provider>
  );
};
