import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface HapticsContextType {
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

const isDev = __DEV__;

const HapticsContext = createContext<HapticsContextType | undefined>(undefined);

export const useHaptics = () => {
  const context = useContext(HapticsContext);
  if (!context) {
    throw new Error('useHaptics must be used within a HapticsProvider');
  }
  return context;
};

interface HapticsProviderProps {
  children: ReactNode;
}

export const HapticsProvider: React.FC<HapticsProviderProps> = ({ children }) => {
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

  useEffect(() => {
    if (!Device.isDevice) {
      if (isDev) console.log('emulator - skip haptic status');
      return;
    };
    loadHapticsPreference();
  }, []);

  const loadHapticsPreference = async () => {
    try {
      const stored = await AsyncStorage.getItem('hapticsEnabled');
      if (isDev) console.log(`Haptics status of ${Device.brand} - ${Device.modelName} from async-storage: ${stored?.toString().toUpperCase()}`);
      if (stored !== null) {
        setHapticsEnabledState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading haptics preference:', error);
    }
  };

  const setHapticsEnabled = async (enabled: boolean) => {
    try {
      setHapticsEnabledState(enabled);
      await AsyncStorage.setItem('hapticsEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('Error saving haptics preference:', error);
    }
  };

  return (
    <HapticsContext.Provider value={{ hapticsEnabled, setHapticsEnabled }}>
      {children}
    </HapticsContext.Provider>
  );
};