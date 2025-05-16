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
};

const UniventHome = ({ navigation }: { navigation: any }) => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [hasCurrentEvents, setHasCurrentEvents] = useState(false);
  const [hasSearchData, setHasSearchData] = useState(false);
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
      setHasSearchData(res.data.length === 0);

    } catch (err: any) {
      console.error('Search error: ', err.message);
    }
    setLoading(false);
  }

  const handleClearSearch = () => {
    setHasSearchData(false);
    setQuery('');
    setSearchActive(false);
    fetchEvents();
    Keyboard.dismiss();
  };

  // debounce search query
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length > 0) {
        searchEvents(trimmedQuery);
      } else {
        setHasSearchData(false);
        fetchEvents();
        setSearchActive(false);
      }
    }, 500); // delay 0.5 sec

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
    setHasSearchData(false);
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
          contentContainerStyle={[styles.scrollContainer]}
          stickyHeaderIndices={[0]}
          keyboardShouldPersistTaps="handled"
          indicatorStyle="white"
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
          <View style={styles.stickyHeader}>
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
              inputStyle={{ color: theme.colorFontLight, fontSize: 14 }}
              theme={{ colors: { primary: theme.colorTaskbarYellow } }}
            />
          </View>
          <View style={styles.container}>

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

              {hasSearchData === true && !loading ? (
                <CustomText style={styles.noEventsFoundText}>No events found</CustomText>
              ) : (
                <CustomText style={styles.headerUpcomingEvent} bold>Upcoming Event</CustomText>
              )}

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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default UniventHome;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: theme.colorBackgroundDark
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 110,
    width: "100%",
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  stickyHeader: {
    backgroundColor: theme.colorBackgroundDark,
    width: '100%',
    maxWidth: 500,
    marginHorizontal: "auto",
    paddingBottom: 12,
    paddingHorizontal: 12
  },
  searchBar: {
    paddingHorizontal: 8,
    backgroundColor: theme.colorSlightDark,
    marginHorizontal: 'auto'
  },
  container: {
    flex: 1,
    width: "98%"
  },
  currentEventsContainer: {
    width: '100%',
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  headerCurrentEvents: {
    color: theme.colorFontLight,
    fontSize: 20,
    marginLeft: 14,
    marginVertical: 6
  },
  upcomingEventsCenterContainer: {
    width: "100%",
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  noEventsFoundText: {
    fontSize: 14,
    color: theme.colorFontLight,
    textAlign: "center"
  },
  headerUpcomingEvent: {
    color: theme.colorFontLight,
    fontSize: 20,
    marginLeft: 14,
    marginVertical: 6
  }
});