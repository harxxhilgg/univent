import { TouchableOpacity, View, StyleSheet, TextInput, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ScrollView, Dimensions } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';
import EventCard from '../components/EventCard';
import CurrentEvents from '../components/CurrentEvents';

interface Event {
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

const DiscoverEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch('http://192.168.195.200:5000/api/events/getAllEvents')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events: ', err));
  }, []);

  const [isFocused, setIsFocused] = useState(false);
  const userContext = useContext(UserContext);

  if (!userContext) {
    return null;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          indicatorStyle='white'
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.searchBarContainer}>
              {
                isFocused ? (
                  <>
                    <TouchableOpacity onPress={() => {
                      setIsFocused(false);
                      Keyboard.dismiss();
                    }}>
                      <Feather name="arrow-left" size={20} color={theme.colorWhite} style={styles.searchBarBackButton} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <Octicons name="search" size={18} color={theme.colorLightGray} style={styles.searchIcon} />
                )
              }
              <TextInput
                style={styles.searchBar}
                placeholder="Search for the events..."
                placeholderTextColor={theme.colorFontGray}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
            <View>
              <CustomText style={styles.headerCurrentEvents}>Current Events</CustomText>
            </View >
            <ScrollView
              horizontal={true}
              scrollEnabled
              style={styles.CurrentEvents}
              indicatorStyle='white'
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <CurrentEvents
                time="10:00 PM"
                location="Dubai"
                title="Gullie Dubai Summer Social: Founders x Investors x Operators"
                organizer="Gullie Global Community Events"
                imageUrl="https://media.istockphoto.com/id/821463698/photo/microphone-over-the-abstract-blurred-photo-of-conference-hall-or-seminar-room-with-attendee.jpg?s=2048x2048&w=is&k=20&c=ldyPYc4cvOouhmNiDfxjxSR0seFLDmVY0zET27XTNEI="
                isPaid
              />
              <CurrentEvents
                time="10:00 PM"
                location="Dubai"
                title="Gullie Dubai Summer Social: Founders x Investors x Operators"
                organizer="Gullie Global Community Events"
                imageUrl="https://c4.wallpaperflare.com/wallpaper/178/707/772/slender-man-wallpaper-preview.jpg"
                isPaid={false}
              />
            </ScrollView>
            <View>
              <View>
                <CustomText style={styles.headerUpcomingEvent}>Upcoming event</CustomText>
              </View>
              {
                events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              }
            </View>
          </View>
          <View style={styles.emptyContainer}></View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default DiscoverEvents;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
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
  searchBarContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
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
    color: theme.colorFontLight
  },
  searchIcon: {
    position: "absolute",
    left: 20,
  },
  searchBarBackButton: {
    position: "absolute",
    left: -27,
    top: -10
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
    marginBottom: -10
  },
  headerUpcomingEvent: {
    color: theme.colorFontLight,
    fontSize: 23,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: width > 450 ? 24 : 14,
    marginBottom: 6,
  },
  emptyContainer: {
    marginVertical: 50
  }
});
