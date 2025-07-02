import React, { useEffect } from 'react';
import { TouchableRipple } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { EventCard } from './EventCard';
import { Event } from '../screens/UniventHome';
import { theme } from '../../theme';

interface AnimatedEventCardProps {
  event: Event;
  onPress: () => void;
  index?: number;
};

const AnimatedEventCard = ({ event, onPress, index = 0 }: AnimatedEventCardProps) => {
  const touchableScale = useSharedValue(1);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.96);

  const animatedButtonStyles = useAnimatedStyle(() => ({
    transform: [{ scale: touchableScale.value }]
  }));

  useEffect(() => {
    const delay = index * 100;

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 300 })
    );

    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 100
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    touchableScale.value = withSpring(0.98, {
      damping: 10,
      stiffness: 500
    });
  };

  const handlePressOut = () => {
    touchableScale.value = withSpring(1, {
      damping: 10,
      stiffness: 500
    });
  };

  return (
    <TouchableRipple
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      rippleColor={theme.colorGray}
    >
      <Animated.View style={[animatedStyles, animatedButtonStyles]}>
        <EventCard event={event} />
      </Animated.View>
    </TouchableRipple>
  );
};

export default AnimatedEventCard;