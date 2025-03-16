import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomTabNavigator from './BottomTabNavigator';
import { UserProvider } from './src/context/UserProvider';
import { theme } from './theme';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import AuthScreen from './src/screens/AuthScreen';
import Signup from './src/screens/Signup';
import Toast from 'react-native-toast-message';
import EventDetails from './src/screens/EventDetails';
import { useEffect, useState, useContext } from 'react';
import * as Font from 'expo-font';
import { UserContext } from './src/context/UserContext';

export type RootStackParamList = {
  Auth: undefined;
  Signup: undefined;
  Main: undefined;
  EventDetails: undefined;
}

const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
  const { isLoading, initialRoute } = useContext(UserContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "Lato-Regular": require("./assets/fonts/Lato-Regular.ttf"),
          "Lato-Bold": require("./assets/fonts/Lato-Bold.ttf"),
        });
        console.log('Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
      }
    }

    loadFonts();
  }, []);

  console.log('AppContent render - fontsLoaded:', fontsLoaded, 'isLoading:', isLoading, 'initialRoute:', initialRoute);

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
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen
            name="EventDetails"
            component={EventDetails}
            options={() => ({
              headerShown: true,
              headerTitle: "Event Details",
              headerStyle: { backgroundColor: theme.colorBackgroundDark },
              headerTintColor: theme.colorTaskbarYellow,
              headerTitleStyle: { fontSize: 22, fontWeight: "bold", letterSpacing: 0.5 },
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
      <Toast position='top' />
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