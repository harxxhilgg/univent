import React, { useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import { calculateTimeUntil, getMonthAndDay } from '../components/EventCard';
import { formatTime } from '../components/EventCard';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';
import { useToast } from '../components/useToast';
import { UserContext } from '../context/UserContext';
import AnimatedButton from '../components/AnimatedButton';

const EventDetails = ({ route }: { route: any }) => {
  // getting full event object from navigation params
  const { event } = route.params;
  const { user } = useContext(UserContext);
  const [timeUntil, setTimeUntil] = useState("");
  const { showInfo, showError } = useToast();
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    setTimeUntil(calculateTimeUntil(event.event_date, event.event_time));
  }, [event.event_date, event.event_time]);

  const formattedTime = formatTime(event.event_time);
  const date = getMonthAndDay(event.event_date);

  const getLongDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'long' }),
      day: date.getDate().toString().padStart(2, '0')
    };
  };

  const eventDateMonth = getLongDate(event.event_date);

  const dateString = event.event_date.toLocaleString().split("T")[0];
  const dateDay = new Date(dateString);

  const options: any = { weekday: 'long' };
  const formattedWeekday = dateDay.toLocaleDateString('en-US', options);

  const handleRegister = () => {
    try {
      setRegisterLoading(true);
      if (event.created_by_email === user.email) {
        showError(3000, "You cannot register for this event", "You are the host of this event");
      } else {
        showInfo(3000, "Feature yet to be implemented");
      };
    } catch (err) {
      console.error(err);
    } finally {
      setRegisterLoading(false);
    };
  };

  const handleGuestRegister = () => {
    try {
      setRegisterLoading(true);
      showInfo(3000, "Guest users cannot register for events", "Please Login or Signup to register");
    } catch (err) {
      console.error(err);
    } finally {
      setRegisterLoading(false);
    };
  };

  return (
    <View style={styles.flexContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        indicatorStyle="white"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Image
            testID='event-image'
            source={{ uri: event.image_url }}
            style={styles.image}
            resizeMode='cover'
          />
          <View style={styles.inlineContainer}>
            <CustomText style={[styles.textWhite, styles.timeUntilContainer]}>{timeUntil}</CustomText>
            <CustomText style={[styles.textWhite, styles.timeLocationContainer]}>{formattedTime}  •  {event.location}</CustomText>
          </View>

          <View style={styles.titleDescContainer}>
            <CustomText style={[styles.textWhite, styles.eventTitleText]}>{event.title}</CustomText>
            <CustomText style={[styles.textWhite, styles.eventOrganizerText]}>{event.organizer}</CustomText>
          </View>

          <View style={styles.secondContainer}>

            <View style={styles.eventTypeInlineContainer}>
              <View style={styles.eventFeeContainer}>
                <FontAwesome6 name="money-check-dollar" size={28} color={theme.colorLightGray} />
              </View>
              <View style={styles.eventFeeDetailsContainer}>
                <CustomText style={styles.eventsFeeDetailsText}>Event Fee</CustomText>
                <CustomText style={styles.eventsFeePaidorFreeText} semibold>{event.is_paid ? "Paid" : "Free"}</CustomText>
              </View>
            </View>

            <View style={styles.eventDateTimeInlineContainer}>
              <View style={styles.dateContainer}>
                <CustomText style={styles.month} bold>{date.month}</CustomText>
                <View style={styles.dayTextContainer}>
                  <CustomText style={styles.day} semibold>{date.day}</CustomText>
                </View>
              </View>
              <View style={styles.eventDateDetailsContainer}>
                <CustomText style={styles.eventDateDetailsText}>
                  {`${formattedWeekday}, ${eventDateMonth.month} ${eventDateMonth.day}`}
                </CustomText>
                <CustomText style={styles.eventTimeDetailsText} semibold>
                  {formattedTime}
                </CustomText>
              </View>
            </View>

            <View style={styles.eventLocationInlineContainer}>
              <View style={styles.eventLocationContainer}>
                <Entypo name="location" size={28} color={theme.colorLightGray} />
              </View>
              <View style={styles.eventLocationDetailsContainer}>
                <CustomText style={styles.eventLocationText} bold>
                  {event.location}
                </CustomText>
              </View>
            </View>
          </View>

          <View style={styles.registerContainer}>
            <AnimatedButton
              label='Register'
              onPress={user.email === 'user.guest@univent.com' ? handleGuestRegister : handleRegister}
              loading={registerLoading}
              disabled={registerLoading}
              variant='light-purple'
              fullWidth
              semibold
              textStyle={styles.registerText}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default EventDetails;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme.colorBackgroundDark
  },
  container: {
    flex: 1,
    paddingBottom: 10,
    width: "95%",
    maxWidth: 500,
    alignSelf: "center"
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10
  },
  inlineContainer: {
    marginTop: 16,
    flexDirection: "row"
  },
  textWhite: {
    color: theme.colorFontLight
  },
  timeUntilContainer: {
    backgroundColor: theme.colorRichBlue,
    alignSelf: "flex-start",
    borderRadius: 24,
    paddingVertical: 2,
    paddingHorizontal: 14,
    fontSize: 12
  },
  timeLocationContainer: {
    fontSize: 13,
    padding: 2,
    paddingHorizontal: 16,
    color: theme.colorLightGray
  },
  titleDescContainer: {
    paddingVertical: 14,
    paddingHorizontal: 4
  },
  eventTitleText: {
    fontSize: 16
  },
  eventOrganizerText: {
    fontSize: 13,
    color: theme.colorFontGray
  },
  secondContainer: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: theme.colorSlightDark,
    borderRadius: 28
  },
  eventTypeInlineContainer: {
    flexDirection: "row"
  },
  eventFeeContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: theme.colorWhite,
    borderRadius: 12
  },
  eventFeeDetailsContainer: {
    marginLeft: 16,
    alignSelf: "center"
  },
  eventsFeeDetailsText: {
    color: theme.colorFontLight,
    fontSize: 14
  },
  eventsFeePaidorFreeText: {
    color: theme.colorFontLight,
    fontSize: 18
  },
  eventDateTimeInlineContainer: {
    flexDirection: "row",
    marginTop: 16
  },
  dateContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    paddingTop: 2,
    alignItems: 'center',
    backgroundColor: theme.colorLightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colorWhite,
  },
  month: {
    fontSize: 14,
    color: theme.colorFontDark,
    textTransform: 'uppercase',
    letterSpacing: 1.3
  },
  dayTextContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colorSlightDark,
    paddingVertical: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11
  },
  day: {
    textAlign: 'center',
    fontSize: 20,
    color: theme.colorLightGray
  },
  eventDateDetailsContainer: {
    marginLeft: 16,
    alignSelf: "center"
  },
  eventDateDetailsText: {
    color: theme.colorFontLight,
    fontSize: 18
  },
  eventTimeDetailsText: {
    color: theme.colorFontLight,
    fontSize: 15
  },
  eventLocationInlineContainer: {
    flexDirection: "row",
    marginTop: 16
  },
  eventLocationContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: theme.colorWhite,
    borderRadius: 12
  },
  eventLocationDetailsContainer: {
    marginLeft: 16,
    alignSelf: "center"
  },
  eventLocationText: {
    color: theme.colorFontLight,
    fontSize: 16
  },
  registerContainer: {
    marginTop: "auto"
  },
  gradientBackground: {
    overflow: "hidden",
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center"
  },
  registerText: {
    color: theme.colorFontDark
  },
});