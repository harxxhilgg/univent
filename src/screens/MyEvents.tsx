import { ScrollView, StyleSheet, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { RefreshControl } from 'react-native-gesture-handler'
import { theme } from '../../theme'
import { Event } from './UniventHome'
import { API_URL } from '../../univent-backend/src/utils/api'
import { UserContext } from '../context/UserContext'
import EventCard from '../components/EventCard'
import CustomText from '../components/CustomText'

const MyEvents = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);


  const fetchWithTimeout = (url: string, timeout: number) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Request timed out ⏳"));
      }, timeout);

      fetch(url)
        .then((response) => {
          clearTimeout(timer); // clearing timeout if req succeeds
          resolve(response);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const fetchEventsByUser = useCallback(async () => {
    try {
      const response: any = await fetchWithTimeout(`${API_URL}/events/user/${user.email}`, 7000);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events: ", err);
    };
  }, [user.email]);

  useEffect(() => {
    fetchEventsByUser(); // initial fetch

    // const interval = setInterval(() => {
    //   fetchEventsByUser();
    // }, 60000); // refresh every 1 min

    // return () => clearInterval(interval); // clean interval on unmount
  }, [fetchEventsByUser]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEventsByUser().finally(() => setRefreshing(false));
  }, [fetchEventsByUser]);

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
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event.id} event={event} hideEndedEvents={true} />
          ))
        ) : (
          <View style={styles.noEventsTextContainer}>
            <CustomText style={styles.noEventsText}>No events found.</CustomText>
          </View>
        )
        }
      </View>
      <View style={styles.emptyContainer}></View>
    </ScrollView>
  )
}

export default MyEvents

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colorBackgroundDark,
    width: "94%",
  },
  emptyContainer: {
    marginVertical: 50
  },
  noEventsTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noEventsText: {
    color: theme.colorFontLight,
    fontSize: 18,
    fontWeight: "bold"
  }
})