import { StyleSheet, View, Platform, Dimensions, Keyboard, UIManager, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// screens
import UniventHome from './src/screens/UniventHome';
import MyEvents from './src/screens/MyEvents';
import CreateEvent from './src/screens/CreateEvent';
import Updates from './src/screens/Updates';
import Settings from './src/screens/Settings';
import { theme } from './theme';

const Tab = createBottomTabNavigator();

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
};

export default function BottomTabNavigator() {
  const { width } = Dimensions.get('window');

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
      ]).start();
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }),
      ]).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    }
  }, [opacity, translateY]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colorBackgroundDark,
        },
        headerTintColor: theme.colorTaskbarYellow,
        tabBarShowLabel: false,
        tabBarStyle: {
          transform: [{ translateY }],
          opacity,
          position: "absolute",
          bottom: 0,
          height: 80,
          backgroundColor: theme.colorSlightDark,
          paddingTop: Platform.OS === 'web' ? 0 : 20,
          marginHorizontal: width > 1000 ? (width - 500) / 2 : 22,
          marginBottom: 28,
          borderRadius: 48,
          overflow: "hidden",
          borderColor: "transparent",
          elevation: 1000,
          boxShadow: "0px 0px 60px #000000",
        },
        tabBarActiveTintColor: theme.colorTaskbarYellow,
        tabBarInactiveTintColor: theme.colorTintInactive,
      }}
    >

      {/* Discover Tab */}

      <Tab.Screen
        name="Univent"
        component={UniventHome}
        options={{
          headerTitle: 'Univent',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 22,
            marginVertical: 15,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="globe" size={size} color={color} />
          ),
        }}
      />

      {/* My-Events Tab */}

      <Tab.Screen
        name="My Events"
        component={MyEvents}
        options={{
          headerTitle: 'My Events',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 22,
            marginVertical: 15,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={(size + 2)} color={color} />
          )
        }}
      />

      {/* createEvent */}

      <Tab.Screen
        name="CreateEvent"
        component={CreateEvent}
        options={{
          headerTitle: 'Create event',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 24,
            marginTop: Platform.OS === 'web' ? 0 : 15,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <View style={styles.customTabButton}>
              <FontAwesome5 name="plus" size={20} color={theme.colorBackgroundDark} />
            </View>
          )
        }}
      />

      {/* Updates Tab */}

      <Tab.Screen
        name="Updates"
        component={Updates}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="tips-and-updates" size={size} color={color} />
          ),
        }}
      />

      {/* Settings Tab */}

      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          headerTitle: 'Settings',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 24,
            marginVertical: 15,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  customTabButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorTaskbarYellow,
    width: 60,
    height: 60,
    borderRadius: 48,
  },
});