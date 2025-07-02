import React from "react";
import { ActivityIndicator, DimensionValue, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { theme } from "../../theme";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "./CustomText";

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'gray' | 'red' | 'light-purple';
  size?: 'small' | 'medium' | 'large';
  width?: DimensionValue;
  fullWidth?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
  bold?: boolean;
  semibold?: boolean;
};

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  width,
  fullWidth = false,
  style,
  contentContainerStyle,
  textStyle,
  bold = false,
  semibold = true
}) => {
  const buttonScale = useSharedValue(1);

  const animatedButtonStyles = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.97, {
      damping: 10,
      stiffness: 500
    });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, {
      damping: 10,
      stiffness: 500
    });
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['rgb(210, 238, 255)', 'rgb(250, 250, 250)', 'rgb(210, 238, 255)'] as const;
      case 'secondary':
        return ['rgb(210, 255, 238)', 'rgb(255, 255, 255)', 'rgb(210, 255, 238)'] as const;
      case 'danger':
        return ['rgb(255, 180, 180)', 'rgb(250, 250, 250)', 'rgb(255, 180, 180)'] as const;
      case 'gray':
        return ['rgb(89, 89, 89)', 'rgb(89, 89, 89)'] as const;
      case 'red':
        return ['rgb(255, 0, 0)', 'rgb(250, 0, 0)'] as const;
      case 'light-purple':
        return ['rgb(220, 210, 250)', 'rgb(255, 255, 255)', 'rgb(220, 210, 250)'] as const;
      default:
        return ['rgb(210, 238, 255)', 'rgb(250, 250, 250)', 'rgb(210, 238, 255)'] as const;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 5,
          paddingHorizontal: 12,
          borderRadius: 8,
          fontSize: 13
        };
      case 'large':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
          fontSize: 17
        };
      default:
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 20,
          fontSize: 15
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const buttonWidth = fullWidth ? '100%' : width;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width: buttonWidth },
        style
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled || loading}
    >
      <Animated.View style={[styles.animatedView, animatedButtonStyles]}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradientBackground,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
              opacity: disabled ? 0.9 : 1
            },
            contentContainerStyle
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
          ) : (
            <CustomText
              style={[
                styles.buttonText,
                { fontSize: sizeStyles.fontSize },
                textStyle
              ]}
              bold={bold}
              semibold={semibold}
            >
              {label}
            </CustomText>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    marginVertical: 5
  },
  animatedView: {
    width: '100%'
  },
  gradientBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  buttonText: {
    color: theme.colorFontDark,
    textAlign: 'center'
  },
  activityIndicator: {
    paddingVertical: 3
  }
});

export default AnimatedButton;