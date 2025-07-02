import { LayoutAnimation, Platform, ScrollView, StyleSheet, TouchableOpacity, UIManager, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import CustomText from '../components/CustomText';
import { RefreshControl } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import axios from 'axios';
import { API_URL } from "../utils/api";
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import { Event as UpcomingEvent } from './UniventHome';
import { checkAndScheduleNotifications } from '../utils/notificationScheduler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
};

const getTimeRemaining = (eventDate: string, eventTime: string): string => {
  const now = new Date();
  const event = new Date(`${eventDate}T${eventTime}`);
  const diff = event.getTime() - now.getTime();

  if (diff <= 0) return 'now';

  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
};

const Updates = () => {
  const [event, setEvent] = useState<null | UpcomingEvent>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const chevronScale = useSharedValue(1);
  const touchableScale = useSharedValue(1);

  const chevronAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: chevronScale.value }]
  }));

  const touchableAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: touchableScale.value }]
  }));

  const chevronPressIn = () => {
    chevronScale.value = withSpring(0.90, {
      damping: 10,
      stiffness: 500
    });
  };

  const chevronPressOut = () => {
    chevronScale.value = withSpring(1, {
      damping: 10,
      stiffness: 500
    });
  };

  const touchablePressIn = () => {
    touchableScale.value = withSpring(0.98, {
      damping: 10,
      stiffness: 500
    });
  };

  const touchablePressOut = () => {
    touchableScale.value = withSpring(1, {
      damping: 10,
      stiffness: 500
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/events/getLatestEvent`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEvent(res.data[0]);

        console.log('Latest event updated, scheduling notification...');
        await checkAndScheduleNotifications();
      } else {
        setEvent(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    setExpanded(!expanded);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      indicatorStyle='white'
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colorWhite}
          colors={[theme.colorWhite]}
          progressBackgroundColor={theme.colorSlightDark}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.upcomingTouchable}>
          <View style={styles.headerRow}>
            <CustomText style={expanded ? styles.headerTextExpanded : styles.headerTextNonExpanded}>
              {
                loading
                  ? 'Loading...'
                  : event
                    ? `Next event ${getTimeRemaining(event.event_date, event.event_time)}`
                    : 'No upcoming event'
              }
            </CustomText>

            <TouchableOpacity
              onPress={toggleExpand}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              onPressIn={chevronPressIn}
              onPressOut={chevronPressOut}
              activeOpacity={1}
            >
              <Animated.View style={chevronAnimatedStyles}>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={expanded ? theme.colorFontGray : theme.colorWhite}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {expanded && event && (
            <View style={styles.eventDetails}>
              <TouchableOpacity
                onPress={() => navigation.navigate('EventDetails', { event })}
                onPressIn={touchablePressIn}
                onPressOut={touchablePressOut}
                activeOpacity={1}
              >
                <Animated.View style={touchableAnimatedStyles}>
                  <CustomText style={styles.eventDetailsTitle}>{event.title}</CustomText>
                </Animated.View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default Updates;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark,
    paddingBottom: 30
  },
  container: {
    flex: 1,
    backgroundColor: theme.colorBackgroundDark,
    width: "95%",
    maxWidth: 500,
    margin: "auto",
    marginTop: Platform.OS === 'web' ? 20 : 0
  },
  upcomingTouchable: {
    backgroundColor: theme.colorSlightDark,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTextExpanded: {
    fontSize: 17,
    color: theme.colorFontGray
  },
  headerTextNonExpanded: {
    fontSize: 17,
    color: theme.colorFontLight
  },
  eventDetails: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: theme.colorTintInactive
  },
  eventDetailsTitle: {
    fontSize: 15,
    color: theme.colorWhite
  }
});