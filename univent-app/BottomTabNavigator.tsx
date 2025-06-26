import { StyleSheet, View, Platform, Dimensions, Keyboard, UIManager, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from './theme';
import { FontAwesome, Fontisto, Ionicons, Octicons } from '@expo/vector-icons';
// screens
import UniventHome from './src/screens/UniventHome';
import MyEvents from './src/screens/MyEvents';
import CreateEvent from './src/screens/CreateEvent';
import Updates from './src/screens/Updates';
import Settings from './src/screens/Settings';

const Tab = createBottomTabNavigator();

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
};

export default function BottomTabNavigator() {
  const { width } = Dimensions.get('window');
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 250,
          duration: 300,
          useNativeDriver: true
        }),
      ]).start();
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }),
      ]).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    }
  }, [translateY]);

  return (
    <Tab.Navigator
      screenOptions={{
        sceneStyle: {
          backgroundColor: theme.colorBackgroundDark
        },
        headerStyle: {
          backgroundColor: theme.colorBackgroundDark,
          elevation: 0,
          shadowOpacity: 0
        },
        headerTintColor: theme.colorTabBarTint,
        tabBarShowLabel: false,
        tabBarPosition: "bottom",
        tabBarStyle: {
          transform: [{ translateY }],
          position: "absolute",
          backgroundColor: theme.colorSlightDark,
          height: 80,
          marginHorizontal: Platform.OS === 'web' ? 0 : width > 1000 ? (width - 500) / 2 : 10,
          paddingTop: 20,
          marginBottom: 2,
          borderRadius: 98,
          overflow: "hidden",
          borderColor: "transparent",
          boxShadow: "0px 0px 60px #000000",
          elevation: 0,
          shadowOpacity: 0
        },
        tabBarItemStyle: {
          height: 64,
          justifyContent: "center",
          alignItems: "center"
        },
        tabBarActiveTintColor: theme.colorTabBarTint,
        tabBarInactiveTintColor: theme.colorTintInactive,
        animation: "shift",
      }}
    >
      <Tab.Screen
        name="Univent"
        component={UniventHome}
        options={{
          headerTitle: 'Univent',
          headerTitleStyle: {
            fontFamily: "DreamAvenue",
            fontSize: 36,
            marginLeft: 4,
            color: theme.colorTabBarTint
          },
          tabBarIcon: ({ color, size }) => (
            <Octicons name="home" size={size} color={color} />
          )
        }}
      />
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
            <Ionicons name="calendar-outline" size={(size + 1)} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="CreateEvent"
        component={CreateEvent}
        options={{
          headerTitle: 'Create Event',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 24,
            marginVertical: 15,
            fontWeight: 'bold'
          },
          tabBarIcon: ({ color, size }) => (
            <View style={styles.customTabButton}>
              <Fontisto name="plus-a" size={20} color={theme.colorBackgroundDark} />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Updates"
        component={Updates}
        options={{
          headerTitle: 'Updates',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 24,
            marginVertical: 15,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb-outline" size={(size + 1)} color={color} />
          )
        }}
      />
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
            <FontAwesome name="user-o" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  customTabButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorTabBarTint,
    width: 55,
    height: 55,
    borderRadius: 98
  }
});