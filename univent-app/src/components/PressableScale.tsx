import React from "react";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type Props = {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number; // defaults to 0.95
  activeOpacity?: number;
};

export default function PressableScale({
  onPress,
  children,
  style,
  pressedScale = 0.95,
  activeOpacity = 1
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const pressIn = () => {
    scale.value = withSpring(pressedScale, {
      damping: 10,
      stiffness: 500
    })
  };

  const pressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 500
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      activeOpacity={activeOpacity}
      style={style}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};