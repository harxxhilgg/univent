import { TouchableOpacity, View, StyleSheet, TextInput, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, ScrollView, Dimensions } from 'react-native';
import { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import Octicons from '@expo/vector-icons/Octicons';
import Feather from '@expo/vector-icons/Feather';
import EventCard from '../components/EventCard';
import CurrentEvents from '../components/CurrentEvents';

const { width } = Dimensions.get('window');

const DiscoverEvents = () => {
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
              <EventCard
                date={{ month: 'NOV', day: 17 }}
                timeUntil="In 25 Min"
                time="10:00 PM"
                location="Dubai"
                title="Gullie Dubai Summer Social: Founders x Investors x Operators"
                organizer="Gullie Global Community Events"
                imageUrl="https://media.istockphoto.com/id/821463698/photo/microphone-over-the-abstract-blurred-photo-of-conference-hall-or-seminar-room-with-attendee.jpg?s=2048x2048&w=is&k=20&c=ldyPYc4cvOouhmNiDfxjxSR0seFLDmVY0zET27XTNEI="
                isPaid
              />
              <EventCard
                date={{ month: 'NOV', day: 28 }}
                timeUntil="In 1 Month"
                time="10:00 PM"
                location="Noida"
                title="Story of Manas Negi: The NEGIMAN"
                organizer="Negiman"
                imageUrl="https://c4.wallpaperflare.com/wallpaper/178/707/772/slender-man-wallpaper-preview.jpg"
                isPaid
              />
              <EventCard
                date={{ month: 'SEP', day: 14 }}
                timeUntil="In 3 Days"
                time="9:30 AM"
                location="Germany"
                title="German Autobahn True Story: Audi RS6 Accident"
                organizer="German Community Events"
                imageUrl="https://images.unsplash.com/photo-1578991132108-16c5296b63dc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                isPaid={false}
              />
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
