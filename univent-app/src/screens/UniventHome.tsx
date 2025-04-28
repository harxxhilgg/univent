import { View, StyleSheet, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import EventCard from '../components/EventCard';
import CurrentEvents from '../components/CurrentEvents';
import { API_URL } from '../utils/api';
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

const UniventHome = ({ navigation }: { navigation: any }) => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [hasCurrentEvents, setHasCurrentEvents] = useState(false);
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
      setUpcomingEvents(res.data || []);

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

  const fetchEvents = useCallback(async () => {
    try {
      function fetchUpcomingEvents() {
        return axios.get(`${API_URL}/events/getUpcomingEvents`);
      };

      function fetchCurrentEvents() {
        return axios.get(`${API_URL}/events/getCurrentEvents`);
      };

      Promise.all([fetchUpcomingEvents(), fetchCurrentEvents()])
        .then(([upcomingEventsResponse, currentEventsResponse]) => {
          setUpcomingEvents(upcomingEventsResponse.data || []);
          setCurrentEvents(currentEventsResponse.data || []);
          setHasCurrentEvents(currentEventsResponse.data?.length > 0);
        })
        .catch(err => {
          console.error('Error fetching events: ', err);
        })
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
                <CustomText style={styles.headerCurrentEvents} bold>Current Events</CustomText>
                <ScrollView
                  horizontal={true}
                  scrollEnabled
                  indicatorStyle="white"
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                >
                  {currentEvents.map((event) => (
                    <CurrentEvents key={event.id} event={event} />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.upcomingEventsCenterContainer}>
              <View>
                <CustomText style={styles.headerUpcomingEvent} bold>Upcoming Events</CustomText>
              </View>
              {upcomingEvents.map((event) => (
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
    width: '96%'
  },
  searchBar: {
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 6,
    fontSize: 16,
    backgroundColor: theme.colorSlightDark,
    width: "100%",
    maxWidth: 500,
    marginHorizontal: 'auto'
  },
  currentEventsContainer: {
    width: '100%',
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  headerCurrentEvents: {
    color: theme.colorFontLight,
    fontSize: 23,
    marginLeft: 10
  },
  headerUpcomingEvent: {
    color: theme.colorFontLight,
    fontSize: 23,
    marginLeft: 10,
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
