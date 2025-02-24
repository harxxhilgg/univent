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
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export type RootStackParamList = {
  Auth: undefined;
  Signup: undefined;
  Main: undefined;
}

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // load fonts 
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Lato-Regular": require("./assets/fonts/Lato-Regular.ttf"),
        "Lato-Bold": require("./assets/fonts/Lato-Bold.ttf"),
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colorFontDark} />
      </View>
    )
  }

  return (
    <>
      <UserProvider>
        <GestureHandlerRootView style={styles.gestureHandlerRootView}>
          <StatusBar barStyle="light-content" backgroundColor={theme.colorBackgroundDark} />
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {/* <Stack.Screen name="Auth" component={AuthScreen} /> */}
              {/* <Stack.Screen name="Signup" component={Signup} /> */}
              <Stack.Screen name="Main" component={BottomTabNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </UserProvider>
      <Toast />
    </>
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