import { StyleSheet, View } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// screens
import UniventHome from './src/screens/UniventHome';
import MyEvents from './src/screens/MyEvents';
import CreateEvent from './src/screens/CreateEvent';
import Messages from './src/screens/Messages';
import Settings from './src/screens/Settings';
import { theme } from './theme';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colorBackgroundDark,
        },
        headerTintColor: theme.colorTaskbarYellow,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          height: 80,
          backgroundColor: theme.colorSlightDark,
          paddingTop: 20,
          marginHorizontal: 22,
          marginBottom: 28,
          borderRadius: 48,
          overflow: "hidden",
          borderColor: "transparent",
          elevation: 0,
          boxShadow: "0px 0px 60px #000000"
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
            marginTop: 15,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <View style={styles.customTabButton}>
              <FontAwesome5 name="plus" size={20} color={theme.colorBackgroundDark} />
            </View>
          )
        }}
      />

      {/* Messages Tab */}

      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={(size + 2)} color={color} />
          ),
        }}
      />

      {/* Settings Tab */}

      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
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