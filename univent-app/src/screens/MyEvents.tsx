import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import { theme } from '../../theme';
import { Event } from './UniventHome';
import { API_URL } from "../utils/api";
import { UserContext } from '../context/UserContext';
import { EventCard } from '../components/EventCard';
import CustomText from '../components/CustomText';
import { TouchableRipple } from 'react-native-paper';
import axios from 'axios';

const MyEvents = ({ navigation }: { navigation: any }) => {
  const { user } = useContext(UserContext);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEventsByUser = useCallback(async () => {
    try {
      function fetchMyEvents() {
        return axios.get(`${API_URL}/events/user/${user.email}`);
      };

      Promise.all([fetchMyEvents()])
        .then(([myEventsResponse]) => {
          setMyEvents(myEventsResponse.data || []);
        })
        .catch(err => {
          console.error('Error fetching events: ', err);
        })
    } catch (err) {
      console.error("Error fetching events: ", err);
    };
  }, [user.email]);

  useEffect(() => {
    fetchEventsByUser(); // initial fetch

    const interval = setInterval(() => {
      fetchEventsByUser();
    }, 60000); // refresh every 1 min

    return () => clearInterval(interval); // clean interval on unmount
  }, [fetchEventsByUser]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEventsByUser().finally(() => setRefreshing(false));
  }, [fetchEventsByUser]);

  return (
    <View style={styles.flexContainer}>
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
          {myEvents.length > 0 ? (
            myEvents.map(event => (
              <TouchableRipple
                key={event.id}
                onPress={() => navigation.navigate('EventDetails', { event })}
                rippleColor={theme.colorGray}
              >
                <EventCard event={event} />
              </TouchableRipple>
            ))
          ) : (
            <View style={styles.noEventsTextContainer}>
              <CustomText style={styles.noEventsText} semibold>No events found.</CustomText>
            </View>
          )
          }
        </View>
      </ScrollView>
    </View>
  );
};

export default MyEvents

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 130,
    backgroundColor: theme.colorBackgroundDark
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 500
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
});