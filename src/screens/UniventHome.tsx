import { TouchableOpacity, View, StyleSheet, TextInput, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ScrollView, Dimensions } from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';
import EventCard from '../components/EventCard';
import CurrentEvents from '../components/CurrentEvents';
import { API_URL } from '../../univent-backend/src/utils/api';
import { RefreshControl } from 'react-native-gesture-handler';
import { TouchableRipple } from 'react-native-paper';

export interface Event {
  id: number;
  title: string;
  organizer: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  is_paid: boolean;
  created_by_email: string;
  created_at: string;
}

const { width } = Dimensions.get('window');

const isEventHappeningNow = (eventDate: string, eventTime: string) => {
  const now = new Date();
  const [hours, minutes, seconds] = eventTime.split(':').map(Number);

  const eventStart = new Date(eventDate); // 2025-03-14T00:00:00.000Z
  eventStart.setHours(hours, minutes, seconds, 0);

  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventStart.getHours() + 2);

  return now >= eventStart && now <= eventEnd;
};

const UniventHome = ({ navigation }: { navigation: any }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const userContext = useContext(UserContext);

  const fetchWithTimeout = (url: string, timeout: number) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Request timed out ⏳"));
      }, timeout);

      fetch(url)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const fetchEvents = useCallback(async () => {
    try {
      const response: any = await fetchWithTimeout(`${API_URL}/events/getAllEvents`, 7000);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events: ", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents().finally(() => setRefreshing(false));
  }, [fetchEvents]);

  if (!userContext) {
    return null;
  }

  const hasCurrentEvents = events.some((event) =>
    isEventHappeningNow(event.event_date, event.event_time)
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          indicatorStyle="white"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colorTaskbarYellow}
              colors={[theme.colorTaskbarYellow]}
              progressBackgroundColor={theme.colorSlightDark}
            />
          }
        >
          <View style={styles.container}>
            <View style={styles.searchBarContainer}>
              {isFocused ? (
                <TouchableOpacity
                  onPress={() => {
                    setIsFocused(false);
                    Keyboard.dismiss();
                  }}
                >
                  <Feather name="arrow-left" size={20} color={theme.colorWhite} style={styles.searchBarBackButton} />
                </TouchableOpacity>
              ) : (
                <Octicons name="search" size={18} color={theme.colorLightGray} style={styles.searchIcon} />
              )}
              <TextInput
                style={styles.searchBar}
                placeholder="Search for the events..."
                placeholderTextColor={theme.colorFontGray}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
            {hasCurrentEvents && (
              <>
                <View>
                  <CustomText style={styles.headerCurrentEvents}>Current Events</CustomText>
                </View>
                <ScrollView
                  horizontal={true}
                  scrollEnabled
                  style={styles.CurrentEvents}
                  indicatorStyle="white"
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                >
                  {events.map((event) => (
                    <CurrentEvents key={event.id} event={event} hideEndedEvents={true} />
                  ))}
                </ScrollView>
              </>
            )}
            <View>
              <View>
                <CustomText style={styles.headerUpcomingEvent}>Upcoming events</CustomText>
              </View>
              {events.map((event) => (
                // passing whole event obejct as prop to EventDetails screen
                <TouchableRipple
                  key={event.id}
                  onPress={() => navigation.navigate('EventDetails', { event })}
                  rippleColor={theme.colorGray}
                >
                  <EventCard event={event} hideEndedEvents={true} />
                </TouchableRipple>
              ))}
            </View>
          </View>
          <View style={styles.emptyContainer}></View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default UniventHome;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: theme.colorBackgroundDark,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colorBackgroundDark,
    width: '94%',
  },
  searchBarContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colorSlightDark,
    borderWidth: 1,
    borderColor: theme.colorLightGray,
    borderRadius: 24,
    paddingHorizontal: 45,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colorFontLight,
  },
  searchIcon: {
    position: 'absolute',
    left: 20,
  },
  searchBarBackButton: {
    position: 'absolute',
    left: -27,
    top: -10,
  },
  headerCurrentEvents: {
    color: theme.colorFontLight,
    fontSize: 23,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 34,
    marginBottom: 6,
  },
  CurrentEvents: {
    height: 280,
    marginBottom: -10,
  },
  headerUpcomingEvent: {
    color: theme.colorFontLight,
    fontSize: 23,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: width > 450 ? 24 : 20,
    marginBottom: 6,
  },
  emptyContainer: {
    marginVertical: 50,
  },
});
