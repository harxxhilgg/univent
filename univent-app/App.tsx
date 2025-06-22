import { ActivityIndicator, BackHandler, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomTabNavigator from './BottomTabNavigator';
import { UserProvider } from './src/context/UserProvider';
import { theme } from './theme';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp, TransitionPresets } from '@react-navigation/stack';
import AuthScreen from './src/screens/AuthScreen';
import Signup from './src/screens/Signup';
import Toast from 'react-native-toast-message';
import EventDetails from './src/screens/EventDetails';
import ForgottenPassword from './src/screens/ForgottenPassword';
import { useEffect, useState, useContext, useRef } from 'react';
import * as Font from 'expo-font';
import { UserContext } from './src/context/UserContext';
import { toastConfig } from './src/configs/toastConfig';
import { setBackgroundColorAsync } from "expo-system-ui";
import { Event } from './src/screens/UniventHome';
import useInternetMonitor from './src/components/useInternetMonitor';
import CustomText from './src/components/CustomText';
import * as Notifications from 'expo-notifications';
import { useToast } from './src/components/useToast';
import Updates from './src/screens/Updates';

export type RootStackParamList = {
  Auth: undefined;
  Signup: undefined;
  Main: undefined;
  EventDetails: { event: Event };
  ForgottenPassword: { email: string };
  Updates: undefined
}

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
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const isOnline = useInternetMonitor();
  const navigationRef = useRef<any>();
  const { showInfo } = useToast();

  useEffect(() => {
    let notificationListener: any;
    let responseListener: any;

    const initializeApp = async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
            name: 'Event Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#877EFF'
          });
          console.log("Notification channel 'event-reminders' set up.");
        }

        await Font.loadAsync({
          "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
          "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
          "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
          "Dynalight": require("./assets/fonts/Dynalight.ttf"),
          "ZenOldMincho": require("./assets/fonts/ZenOldMincho.ttf"),
          "DreamAvenue": require("./assets/fonts/DreamAvenue.ttf")
        });
        setFontsLoaded(true);

        notificationListener = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification Received: ', notification);

          // @ts-ignore
          showInfo(4000, notification.request.content.title || "New Notification", notification.request.content.body);
        });

        responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log(' Notification tapped: ', response);

          try {
            const data = response.notification.request.content.data;

            if (!data || !navigationRef.current) return;

            if (data.eventId) {
              const eventData = {
                id: parseInt(data.eventId) || data.eventId,
                title: data.title || 'Event',
                organizer: data.organizer || '',
                event_date: data.event_date || '',
                event_time: data.event_time || '',
                location: data.location || '',
                image_url: data.image_url || '',
                is_paid: data.is_paid === 'true' || data.is_paid === true,
                created_by_email: data.created_by_email || '',
                created_at: data.created_at || new Date().toISOString(),
                ...data
              };

              console.log('Navigating to EventDetails with data: ', eventData);

              navigationRef.current.navigate('EventDetails', {
                event: eventData
              });
            } else if (data.screen) {
              const validScreens = ['My Events', 'Updates', 'Settings', 'Univent'];
              if (validScreens.includes(data.screen)) {
                navigationRef.current.navigate(data.screen);
              }
            }
          } catch (err) {
            console.error('Navigation error from notification: ', err);
          };
        });
      } catch (error) {
        console.error('App Intialization Error: ', error);
      }
    };

    initializeApp();

    return () => {
      if (notificationListener) {
        Notifications.removeNotificationSubscription(notificationListener);
      }
      if (responseListener) {
        Notifications.removeNotificationSubscription(responseListener);
      }
    };

  }, [isOnline, showInfo]);

  const handleClose = () => {
    BackHandler.exitApp();
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.offlineContainer}>
        <ActivityIndicator size="large" color={theme.colorFontLight} />
        <CustomText style={styles.offlineTitle} bold>Font Load Error</CustomText>

        <CustomText style={styles.delayedMessage}>
          The required fonts failed to load. This may be due to a network or system issue.
          Please try closing and reopening the application to fix the problem.
        </CustomText>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <CustomText style={styles.closeButtonText} bold>Close</CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  if (!isOnline) {
    return (
      <View style={styles.offlineContainer}>
        <ActivityIndicator size={40} color={theme.colorFontLight} />
        <CustomText style={styles.offlineTitle} bold>No Internet Connection</CustomText>

        <CustomText style={styles.delayedMessage}>
          Please check your internet connection and try again. Make sure you're connected to Wi-Fi or mobile data.
        </CustomText>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App() {
  setBackgroundColorAsync(theme.colorBackgroundDark);
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
    justifyContent: "center"
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
  offlineTitle: {
    fontSize: 18,
    color: theme.colorFontLight,
    marginVertical: 24,
    textAlign: "center"
  },
  delayedMessage: {
    color: theme.colorFontLight,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20
  },
  closeButton: {
    paddingHorizontal: 30,
    paddingVertical: 6,
    backgroundColor: theme.colorWhite,
    borderRadius: 10,
    marginTop: 10
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