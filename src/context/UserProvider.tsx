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

  console.log('UserProvider initialized');

  useEffect(() => {
    console.log('useEffect triggered');
    async function checkAuth() {
      console.log('Starting auth check');
      const timeout = setTimeout(() => {
        if (isLoading) {
          somethingWentWrong();
          setInitialRoute('Auth');
          setIsLoading(false);
        }
      }, 5000);

      try {
        console.log('Attempting to get token from AsyncStorage');
        const authToken = await AsyncStorage.getItem('authToken');
        console.log('Retrieved token:', authToken);

        if (authToken) {
          const decoded = decodeJwtPayload(authToken);
          console.log('Decoded token:', decoded);

          if (decoded && decoded.userId && decoded.username && decoded.email) {
            const currentTime = Math.floor(Date.now() / 1000);
            console.log('Current time:', currentTime, 'Token exp:', decoded.exp);

            if (decoded.exp && decoded.exp < currentTime) {
              console.log('Token expired');
              await AsyncStorage.removeItem('authToken');
              setInitialRoute('Auth');
            } else {
              console.log('Token valid, setting user:', {
                id: decoded.userId,
                username: decoded.username,
                email: decoded.email,
              });
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
          console.log('No token found');
          setInitialRoute('Auth');
        }
      } catch (err) {
        console.error('Error checking auth: ', err);
        setInitialRoute('Auth');
      } finally {
        clearTimeout(timeout);
        console.log('Auth check complete, initialRoute:', initialRoute);
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
