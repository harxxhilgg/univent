import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
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
import { useEffect, useState, useContext } from 'react';
import * as Font from 'expo-font';
import { UserContext } from './src/context/UserContext';
import { toastConfig } from './src/configs/toastConfig';
import { setBackgroundColorAsync } from "expo-system-ui";
import { Event } from './src/screens/UniventHome';

export type RootStackParamList = {
  Auth: undefined;
  Signup: undefined;
  Main: undefined;
  EventDetails: { event: Event };
}

const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
  const { isLoading, initialRoute } = useContext(UserContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
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
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colorFontDark} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureHandlerRootView}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colorBackgroundDark} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={() => ({
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
});

export type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, "Auth">;
export type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, "Signup">;
export type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;
export type EventDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, "EventDetails">;