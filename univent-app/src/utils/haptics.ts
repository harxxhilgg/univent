import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

let hapticsEnabled: boolean = true;

export const initializeHaptics = async () => {
  try {
    // either true or false
    const stored = await AsyncStorage.getItem("hapticsEnabled");
    if (stored !== null) {
      hapticsEnabled = JSON.parse(stored);
    }
  } catch (error) {
    console.error("error getting haptic info from async-storage: ", error);
  }
};

export const updateHapticsEnabled = (enabled: boolean) => {
  hapticsEnabled = enabled;
};

export const conditionalHaptics = {
  impactAsync: (style: Haptics.ImpactFeedbackStyle) => {
    if (hapticsEnabled) {
      return Haptics.impactAsync(style);
    }
    return Promise.resolve();
  },
  notificationAsync: (type: Haptics.NotificationFeedbackType) => {
    if (hapticsEnabled) {
      return Haptics.notificationAsync(type);
    }
    return Promise.resolve();
  },
  selectionAsync: () => {
    if (hapticsEnabled) {
      return Haptics.selectionAsync();
    }
    return Promise.resolve();
  },
};
