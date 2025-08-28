import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { useToast } from "../components/useToast";
import { registerForPushNotifications, requestNotificationPermission } from "../utils/notifications";
import { decodeJwtPayload } from "../utils/auth";

interface ProviderProps {
  children?: React.ReactNode;
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
