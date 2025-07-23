import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import BottomTabNavigator from './BottomTabNavigator';
import AuthScreen from './src/screens/AuthScreen';
import Signup from './src/screens/Signup';
import Toast from 'react-native-toast-message';
import EventDetails from './src/screens/EventDetails';
import ForgottenPassword from './src/screens/ForgottenPassword';
import useInternetMonitor from './src/components/useInternetMonitor';
import CustomText from './src/components/CustomText';
import Updates from './src/screens/Updates';
import { ActivityIndicator, BackHandler, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from './src/context/UserProvider';
import { theme } from './theme';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp, TransitionPresets } from '@react-navigation/stack';
import { useEffect, useState, useContext } from 'react';
import { UserContext } from './src/context/UserContext';
import { toastConfig } from './src/configs/toastConfig';
import { setBackgroundColorAsync } from "expo-system-ui";
import { Event } from './src/screens/UniventHome';
import { useToast } from './src/components/useToast';
import { Image } from 'expo-image';
import LegalScreen from './src/screens/LegalScreen';

const isDev = __DEV__;

export type RootStackParamList = {
  Auth: undefined;
  Signup: undefined;
  Main: undefined;
  EventDetails: { event: Event };
  ForgottenPassword: { email: string };
  Updates: undefined;
  Legal: { type: 'privacy' | 'tos' };
};

const Stack = createStackNavigator<RootStackParamList>();
const ANDROID_CHANNEL_ID = "event-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

function AppContent() {
  const { initialRoute } = useContext(UserContext);
  const [showFullFontError, setShowFullFontError] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const isOnline = useInternetMonitor();
  const { showInfo } = useToast();

  useEffect(() => {
    let fontTimer: any;
    let notificationListener: any;

    const initializeApp = async () => {
      try {
        // load fonts
        if (!fontsLoaded) {
          fontTimer = setTimeout(() => {
            setShowFullFontError(true);
          }, 5000);
        };

        await Font.loadAsync({
          "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
          "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
          "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
          "Dynalight": require("./assets/fonts/Dynalight.ttf"),
          "ZenOldMincho": require("./assets/fonts/ZenOldMincho.ttf"),
          "DreamAvenue": require("./assets/fonts/DreamAvenue.ttf")
        });
        setFontsLoaded(true);

        // Set up notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
            name: 'Event Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#ffffff',
            sound: 'default'
          });
        }

        // listen for notifications received while app is open
        notificationListener = Notifications.addNotificationReceivedListener(notification => {
          if (isDev) console.log("Notification received: ", notification.request.content.title);
          showInfo(4000, notification.request.content.title || "New Notification", notification.request.content.body ?? undefined);
        });

      } catch (error) {
        console.error('App Intialization Error: ', error);
      }
    };

    initializeApp();

    return () => {
      if (fontTimer) clearTimeout(fontTimer);
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
    };
  }, [showInfo, fontsLoaded]);

  const handleClose = () => {
    BackHandler.exitApp();
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.offlineContainer}>
        <ActivityIndicator size="large" color={theme.colorFontLight} />
        {showFullFontError && (
          <>
            <CustomText style={styles.offlineTitle} bold>Error Loading Fonts</CustomText>
            <CustomText style={styles.delayedMessage}>
              The required fonts failed to load. This may be due to a network or system issue.
              Please try closing and reopening the application to fix the problem.
            </CustomText>

            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <CustomText style={styles.closeButtonText} bold>Close</CustomText>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  if (!isOnline) {
    return (
      <View style={styles.offlineContainer}>
        <Image
          style={styles.image}
          source={require('./assets/icons/image-no-connection.png')}
        />
        <CustomText style={styles.offlineTitle} bold>Oh shucks !!</CustomText>
        <View style={styles.inlineContainer}>
          <ActivityIndicator size={18} color={theme.colorFontLight} />
          <CustomText style={styles.inlineText}>Retrying connection...</CustomText>
        </View>
        <CustomText style={styles.offlineMessage}>
          Please check your internet connection and try again. Make sure you're connected to Wi-Fi or mobile data.
        </CustomText>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <CustomText style={styles.closeButtonText} bold>Close</CustomText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureHandlerRootView}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colorBackgroundDark} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            cardStyle: {
              backgroundColor: theme.colorBackgroundDark
            }
          }}
        >
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={() => ({
              ...TransitionPresets.ModalFadeTransition
            })}
          />
          <Stack.Screen
            name="ForgottenPassword"
            component={ForgottenPassword}
            options={() => ({
              headerShown: true,
              headerTitle: "",
              headerBackButtonDisplayMode: "minimal",
              headerStyle: { backgroundColor: theme.colorBackgroundDark },
              headerTintColor: theme.colorTabBarTint,
              headerTitleStyle: { fontSize: 22, fontWeight: "bold", letterSpacing: 0.5 },
              ...TransitionPresets.ModalFadeTransition
            })}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={() => ({
              ...TransitionPresets.ModalFadeTransition
            })}
          />
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
            options={() => ({
              ...TransitionPresets.ModalFadeTransition
            })}
          />
          <Stack.Screen
            name="Updates"
            component={Updates}
            options={() => ({
              ...TransitionPresets.ModalFadeTransition
            })}
          />
          <Stack.Screen
            name="EventDetails"
            component={EventDetails}
            options={() => ({
              headerShown: true,
              headerTitle: "Event Details",
              headerBackButtonDisplayMode: "minimal",
              headerStyle: { backgroundColor: theme.colorBackgroundDark },
              headerTintColor: theme.colorTabBarTint,
              headerTitleStyle: { fontSize: 22, fontWeight: "bold", letterSpacing: 0.5 },
              ...TransitionPresets.BottomSheetAndroid
            })}
          />
          <Stack.Screen
            name="Legal"
            component={LegalScreen}
            options={({ route }) => ({
              headerShown: true,
              title: route.params.type === 'privacy' ? 'Privacy Policy' : 'Terms of Service',
              headerStyle: { backgroundColor: theme.colorBackgroundDark },
              headerTintColor: theme.colorTabBarTint,
              headerTitleStyle: { fontSize: 22, fontWeight: "bold", letterSpacing: 0.5 },
              ...TransitionPresets.FadeFromBottomAndroid
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await setBackgroundColorAsync(theme.colorBackgroundDark);
      } catch (e) {
        if (isDev) console.warn(e);
      } finally {
        setIsReady(true);
      };
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colorFontLight} />
      </View>
    );
  }

  return (
    <UserProvider>
      <AppContent />
      <Toast position='top' config={toastConfig} />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  gestureHandlerRootView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colorBackgroundDark
  },
  offlineContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "90%",
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  image: {
    aspectRatio: 1 / 1,
    width: "100%",
    height: 150,
    alignSelf: "center"
  },
  delayedMessage: {
    color: theme.colorFontLight,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 20,
    marginBottom: 2
  },
  offlineTitle: {
    fontSize: 26,
    color: theme.colorFontLight,
    marginTop: 24,
    textAlign: "center"
  },
  inlineContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 10,
    gap: 16
  },
  inlineText: {
    color: theme.colorFontLight,
    fontSize: 14
  },
  offlineMessage: {
    color: theme.colorFontLight,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4
  },
  closeButton: {
    width: 200,
    paddingVertical: 6,
    backgroundColor: theme.colorWhite,
    borderRadius: 10,
    marginTop: 14,
    alignItems: "center"
  },
  closeButtonText: {
    color: theme.colorFontDark,
    fontSize: 16
  }
});

export type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, "Auth">;
export type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, "Signup">;
export type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;
export type EventDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, "EventDetails">;
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, "ForgottenPassword">;
export type UpdatesNavigationProp = StackNavigationProp<RootStackParamList, "Updates">;
export type LegalNavigationProp = StackNavigationProp<RootStackParamList, "Legal">;