import { View, StyleSheet, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import EventCard from '../components/EventCard';
import CurrentEvents from '../components/CurrentEvents';
import { API_URL } from '../../univent-backend/src/utils/api';
import { RefreshControl } from 'react-native-gesture-handler';
import { ActivityIndicator, Searchbar, TouchableRipple } from 'react-native-paper';
import axios from 'axios';

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

const isEventHappeningNow = (eventDate: string, eventTime: string) => {
  const now = new Date();
  const [hours, minutes, seconds] = eventTime.split(':').map(Number);

  const eventStart = new Date(eventDate); // 2025-03-14
  eventStart.setHours(hours, minutes, seconds, 0);

  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventStart.getHours() + 2);

  return now >= eventStart && now <= eventEnd;
};

const UniventHome = ({ navigation }: { navigation: any }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const userContext = useContext(UserContext);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const searchEvents = async (q: any) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/events/search`, {
        params: { q }
      });
      setEvents(res.data);
    } catch (err: any) {
      console.error('Search error: ', err.message);
    }
    setLoading(false);
  }

  const handleClearSearch = () => {
    setQuery('');
    setSearchActive(false);
    fetchEvents();
    Keyboard.dismiss();
  };

  // debounce search query
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        searchEvents(query.trim());
      } else {
        fetchEvents();
        setSearchActive(false);
      }
    }, 400); // delay 0.4 sec

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
            <Searchbar
              placeholder='Search events by title'
              onChangeText={(text) => {
                setQuery(text);
                setSearchActive(true);
              }}
              value={query}
              autoCapitalize='sentences'
              onClearIconPress={handleClearSearch}
              icon={searchActive ? 'arrow-left' : 'magnify'}
              style={styles.searchBar}
              iconColor={searchActive ? theme.colorTaskbarYellow : theme.colorFontGray}
              placeholderTextColor={theme.colorFontGray}
              inputStyle={{ color: theme.colorFontLight }}
              theme={{ colors: { primary: theme.colorTaskbarYellow } }}
            />

            {loading && <ActivityIndicator animating={true} style={{ marginTop: 20 }} />}

            {hasCurrentEvents && (
              <View style={styles.currentEventsContainer}>
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
              </View>
            )}
            <View style={styles.upcomingEventsCenterContainer}>
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
  searchBar: {
    marginTop: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: theme.colorSlightDark,
    width: "100%",
    maxWidth: 500,
    marginHorizontal: 'auto'
  },
  currentEventsContainer: {
    width: '100%',
    maxWidth: 500,
    marginHorizontal: 'auto'
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
    marginLeft: 10,
    marginBottom: Platform.OS === 'web' ? 12 : 6
  },
  upcomingEventsCenterContainer: {
    width: "100%",
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  emptyContainer: {
    marginVertical: 50,
  }
});
