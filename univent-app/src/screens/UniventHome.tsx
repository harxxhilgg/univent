import axios from 'axios';
import CustomText from '../components/CustomText';
import AnimatedEventCard from '../components/AnimatedEventCard';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { ActivityIndicator, Searchbar } from 'react-native-paper';
import { UserContext } from '../context/UserContext';
import { api, API_URL } from '../utils/api';
import { theme } from '../../theme';
import { CurrentEvents } from '../components/CurrentEvents';

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
  const prevUpcomingRef = useRef<Event[]>([]);
  const prevCurrentRef = useRef<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [fullUpcomingEvents, setFullUpcomingEvents] = useState<Event[]>([]);
  const [hasCurrentEvents, setHasCurrentEvents] = useState(false);
  const [hasSearchData, setHasSearchData] = useState(false);
  const [showCurrentEvents, setShowCurrentEvents] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const userContext = useContext(UserContext);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    setVisibleCount(5);
  }, [upcomingEvents]);

  const handleLoadMore = () => {
    if (visibleCount < upcomingEvents.length) {
      setVisibleCount(prev => Math.min(prev + 5, upcomingEvents.length));
    }
  };

  const searchEvents = async (q: any) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/events/search`, {
        params: { q }
      });
      setUpcomingEvents(res.data || []);
      setShowCurrentEvents(false);
      setHasSearchData(res.data.length === 0);
    } catch (err: any) {
      console.error('Search error: ', err.message);
    } finally {
      setLoading(false);
    };
  };

  const handleClearSearch = () => {
    setHasSearchData(false);
    setQuery('');
    setSearchActive(false);
    setShowCurrentEvents(true);
    setUpcomingEvents(fullUpcomingEvents);
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
        setShowCurrentEvents(true);
        setSearchActive(false);
        setUpcomingEvents(fullUpcomingEvents);
      }
    }, 500); // delay 0.5 sec

    return () => clearTimeout(delayDebounce);
  }, [query, fullUpcomingEvents]);

  const areArraysEqual = (arr1: Event[], arr2: Event[]) => {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  };

  const fetchEvents = useCallback(async () => {
    try {
      const [upcomingRes, currentRes] = await Promise.all([
        api.get('/events/getUpcomingEvents'),
        api.get('/events/getCurrentEvents')
      ]);

      const newUpcomingData = upcomingRes.data || [];
      const newCurrentData = currentRes.data || [];

      if (!areArraysEqual(prevUpcomingRef.current, newUpcomingData)) {
        prevUpcomingRef.current = newUpcomingData;
        setUpcomingEvents(newUpcomingData);
        setFullUpcomingEvents(newUpcomingData);
      };

      if (!areArraysEqual(prevCurrentRef.current, newCurrentData)) {
        prevCurrentRef.current = newCurrentData;
        setCurrentEvents(newCurrentData);
        setHasCurrentEvents(newCurrentData.length > 0);
      };

    } catch (err) {
      console.error("Error fetching events: ", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setHasSearchData(false);
    setRefreshing(true);
    fetchEvents().finally(() => {
      setRefreshing(false);
      isRefreshingRef.current = false
    });
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
        <>
          <View style={styles.stickyHeader}>
            <Searchbar
              placeholder='Search events by title...'
              onChangeText={(text) => {
                setQuery(text);
                setSearchActive(true);
              }}
              value={query}
              autoCapitalize='sentences'
              onClearIconPress={handleClearSearch}
              icon={searchActive ? 'arrow-left' : 'magnify'}
              style={styles.searchBar}
              iconColor={theme.colorLightGray}
              placeholderTextColor={theme.colorFontGray}
              inputStyle={{ color: theme.colorFontLight, fontSize: 14 }}
              theme={{ colors: { primary: theme.colorTaskbarYellow } }}
            />
          </View>
          <ScrollView
            contentContainerStyle={[styles.scrollContainer]}
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
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              if (
                layoutMeasurement.height + contentOffset.y >= contentSize.height - 50
              ) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={16}
          >
            <View style={styles.container}>
              {loading && <ActivityIndicator animating={true} style={{ marginTop: 20 }} />}
              {hasCurrentEvents && showCurrentEvents && (
                <View style={styles.currentEventsContainer}>
                  <CustomText style={styles.headerCurrentEvents} bold>Current Events</CustomText>
                  <ScrollView
                    horizontal={true}
                    scrollEnabled={true}
                    indicatorStyle="black"
                    showsHorizontalScrollIndicator={false}
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

                {upcomingEvents.slice(0, visibleCount).map((event, index) => (
                  <AnimatedEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onPress={() => navigation.navigate('EventDetails', { event })}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </>
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
    alignItems: 'center',
    paddingBottom: 100,
    width: "100%",
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  stickyHeader: {
    backgroundColor: theme.colorBackgroundDark,
    width: '100%',
    maxWidth: 500,
    marginHorizontal: "auto",
    paddingBottom: 10,
    paddingHorizontal: 12
  },
  searchBar: {
    paddingHorizontal: 2,
    backgroundColor: theme.colorSlightDark,
    marginHorizontal: 'auto'
  },
  container: {
    width: "100%"
  },
  currentEventsContainer: {
    width: '100%',
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  headerCurrentEvents: {
    color: theme.colorFontLight,
    fontSize: 20,
    paddingHorizontal: 14,
    marginVertical: 6
  },
  upcomingEventsCenterContainer: {
    width: "100%",
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  noEventsFoundText: {
    fontSize: 16,
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