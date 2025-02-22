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

  const fetchEventsByUser = useCallback(async () => {
    return fetch(`${API_URL}/events/user/${user.email}`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events: ', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchEventsByUser();
  }, [fetchEventsByUser])

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
    fontSize: 18
  }
})