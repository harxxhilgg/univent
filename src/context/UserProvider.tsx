import { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const somethingWentWrong = () => {
  Toast.show({
    autoHide: true,
    visibilityTime: 2500,
    type: 'Authentication check timed out!',
    text1: 'Please try again.',
  });
};

export const UserProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Auth' | 'Main'>('Auth');

  useEffect(() => {
    async function checkAuth() {
      const timeout = setTimeout(() => {
        if (isLoading) {
          somethingWentWrong();
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
            console.log(`token will be expired after: ${currentTime}/${decoded.exp}`)

            if (decoded.exp && decoded.exp < currentTime) {
              await AsyncStorage.removeItem('authToken');
              setInitialRoute('Auth');
            } else {
              setUser({
                id: decoded.userId,
                username: decoded.username,
                email: decoded.email
              });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, initialRoute }}>
      {children}
    </UserContext.Provider>
  );
};
