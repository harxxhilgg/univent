import { ActivityIndicator, BackHandler, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
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
import { useEffect, useState, useContext } from 'react';
import * as Font from 'expo-font';
import { UserContext } from './src/context/UserContext';
import { toastConfig } from './src/configs/toastConfig';
import { setBackgroundColorAsync } from "expo-system-ui";
import { Event } from './src/screens/UniventHome';
import useInternetMonitor from './src/components/useInternetMonitor';
import CustomText from './src/components/CustomText';

export type RootStackParamList = {
  Auth: undefined;
  Signup: undefined;
  Main: undefined;
  EventDetails: { event: Event };
  ForgottenPassword: { email: string };
}

const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
  const { isLoading, initialRoute } = useContext(UserContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const isOnline = useInternetMonitor();

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
          "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
          "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
          "Dynalight": require("./assets/fonts/Dynalight.ttf"),
          "ZenOldMincho": require("./assets/fonts/ZenOldMincho.ttf"),
          "DreamAvenue": require("./assets/fonts/DreamAvenue.ttf")
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
      };
    };

    loadFonts();
  }, [isOnline]);

  const handleClose = () => {
    BackHandler.exitApp();
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colorFontLight} />
      </View>
    );
  };

  if (!isOnline) {
    return (
      <View style={styles.offlineContainer}>
        <ActivityIndicator size="large" color={theme.colorFontLight} />
        <CustomText style={styles.offlineTitle} bold>No Internet Connection</CustomText>

        <CustomText style={styles.delayedMessage}>
          Please check your internet connection and try again. Make sure you're connected to Wi-Fi or mobile data.
        </CustomText>

        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <CustomText style={styles.closeButtonText} bold>Close Application</CustomText>
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
            name="EventDetails"
            component={EventDetails}
            options={() => ({
              headerShown: true,
              headerTitle: "Event Details",
              headerBackButtonDisplayMode: "minimal",
              headerStyle: { backgroundColor: theme.colorBackgroundDark },
              headerTintColor: theme.colorTabBarTint,
              headerTitleStyle: { fontSize: 22, fontWeight: "bold", letterSpacing: 0.5 },
              ...TransitionPresets.ModalFadeTransition
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
    marginVertical: 20,
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