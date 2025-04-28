import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import { calculateTimeUntil, getMonthAndDay } from '../components/EventCard';
import { formatTime } from '../components/EventCard';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';
import { useToast } from '../components/useToast';

const EventDetails = ({ route, navigation }: { route: any, navigation: any }) => {
  // getting full event object from navigation params
  const { event } = route.params;

  const [timeUntil, setTimeUntil] = useState("");
  const { showInfo } = useToast();

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
          <Image source={{ uri: event.image_url }} style={styles.image} />
          <View style={styles.inlineContainer}>
            <CustomText style={[styles.textWhite, styles.timeUntilContainer]}> {timeUntil} </CustomText>
            <CustomText style={[styles.textWhite, styles.timeLocationContainer]}>{formattedTime}  •  {event.location}</CustomText>
          </View>
          <View style={styles.titleDescContainer}>
            <CustomText style={[styles.textWhite, styles.eventTitleText]}>{event.title}</CustomText>
            <CustomText style={[styles.textWhite, styles.eventOrganizerText]}>{event.organizer}</CustomText>
          </View>

          <View style={styles.secondContainer}>

            <View style={styles.eventTypeInlineContainer}>
              <View style={styles.eventFeeContainer}>
                <FontAwesome6 name="money-bills" size={24} color={theme.colorTaskbarYellow} />
              </View>
              <View style={styles.eventFeeDetailsContainer}>
                <View>
                  <CustomText style={styles.eventsFeeDetailsText}>Event Fee</CustomText>
                </View>
                <View>
                  <CustomText style={styles.eventsFeePaidorFreeText} bold>{event.is_paid ? "Paid" : "Free"}</CustomText>
                </View>
              </View>
            </View>

            <View style={styles.eventDateTimeInlineContainer}>
              <View style={styles.dateContainer}>
                <CustomText style={styles.month} bold>{date.month}</CustomText>
                <View style={styles.dayTextContainer}>
                  <CustomText style={styles.day} bold>{date.day}</CustomText>
                </View>
              </View>
              <View style={styles.eventDateDetailsContainer}>
                <View>
                  <CustomText style={styles.eventDateDetailsText}>
                    {`${formattedWeekday}, ${eventDateMonth.month} ${eventDateMonth.day}`}
                  </CustomText>
                </View>
                <View>
                  <CustomText style={styles.eventTimeDetailsText} bold>
                    {formattedTime}
                  </CustomText>
                </View>
              </View>
            </View>

            <View style={styles.eventLocationInlineContainer}>
              <View style={styles.eventLocationContainer}>
                <Entypo name="location" size={28} color={theme.colorTaskbarYellow} />
              </View>
              <View style={styles.eventLocationDetailsContainer}>
                <View>
                  <CustomText style={styles.eventLocationText} bold>
                    {event.location}
                  </CustomText>
                </View>
              </View>
            </View>
          </View >

          <View style={styles.registerContainer}>
            <TouchableOpacity
              onPress={() => showInfo(2500, 'Feature yet to be implemented.')}
              style={styles.registerTouchable}
            >
              <CustomText style={styles.registerText}>Register</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView >
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
    backgroundColor: theme.colorBackgroundDark,
    paddingBottom: 30,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    padding: 16,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center"
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12
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
    paddingHorizontal: 8,
    fontSize: 14,
    marginBottom: 4,
  },
  timeLocationContainer: {
    padding: 2,
    paddingHorizontal: 16,
    color: theme.colorTaskbarYellow
  },
  titleDescContainer: {
    paddingVertical: 14,
    paddingHorizontal: 4
  },
  eventTitleText: {
    fontSize: 20,
    letterSpacing: 0.5
  },
  eventOrganizerText: {
    fontSize: 14,
    color: theme.colorFontGray,
    letterSpacing: 0.5
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
    borderColor: theme.colorTaskbarYellow,
    borderRadius: 12
  },
  eventFeeDetailsContainer: {
    marginLeft: 16,
    alignSelf: "center"
  },
  eventsFeeDetailsText: {
    color: theme.colorFontLight,
    fontSize: 15
  },
  eventsFeePaidorFreeText: {
    color: theme.colorTaskbarYellow,
    fontSize: 20
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
    backgroundColor: theme.colorTaskbarYellow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colorTaskbarYellow,
  },
  month: {
    fontSize: 14,
    color: theme.colorFontDark,
    textTransform: 'uppercase',
    letterSpacing: 1.3
  },
  dayTextContainer: {
    width: '100%',
    backgroundColor: theme.colorSlightDark,
    paddingVertical: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11
  },
  day: {
    textAlign: 'center',
    fontSize: 22,
    color: theme.colorFontLight
  },
  eventDateDetailsContainer: {
    marginLeft: 16,
    alignSelf: "center"
  },
  eventDateDetailsText: {
    color: theme.colorFontLight,
    fontSize: 20
  },
  eventTimeDetailsText: {
    color: theme.colorTaskbarYellow,
    fontSize: 16
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
    borderColor: theme.colorTaskbarYellow,
    borderRadius: 12
  },
  eventLocationDetailsContainer: {
    marginLeft: 16,
    alignSelf: "center"
  },
  eventLocationText: {
    color: theme.colorFontLight,
    fontSize: 18
  },
  registerContainer: {
    marginTop: "auto"
  },
  registerTouchable: {
    backgroundColor: theme.colorTaskbarYellow,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 24
  },
  registerText: {
    color: theme.colorFontDark
  },
});