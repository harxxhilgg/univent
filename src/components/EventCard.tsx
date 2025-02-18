import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import CustomText from './CustomText';

interface EventAPI {
  id: number;
  title: string;
  organizer: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  is_paid?: boolean;
  created_by_email: string;
  created_at: string;
};

interface EventCardProps {
  event: EventAPI;
};

const getMonthAndDay = (dateString: string) => {
  const date = new Date(dateString);
  return {
    month: date.toLocaleString('default', { month: 'short' }),
    day: date.getDate()
  };
};

const calculteTimeUntil = (eventDate: string, eventTime: string) => {
  const now = new Date();
  const eventDateTime = new Date(`${eventDate.split('T')[0]}T${eventTime}`);

  const diffTime = eventDateTime.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Event Ended';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays} days left`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
  return `${Math.floor(diffDays / 30)} months left`;
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

export default function EventCard({ event }: EventCardProps) {
  const [timeUntil, setTimeUntil] = useState('');

  useEffect(() => {
    setTimeUntil(calculteTimeUntil(event.event_date, event.event_time));

    const timer = setInterval(() => {
      setTimeUntil(calculteTimeUntil(event.event_date, event.event_time));
    }, 6000);

    return () => clearInterval(timer);
  }, [event.event_date, event.event_time]);

  const date = getMonthAndDay(event.event_date);
  const formattedTime = formatTime(event.event_time);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.dateContainer}>
          <CustomText style={styles.month}>{date.month}</CustomText>
          <CustomText style={styles.day}>{date.day}</CustomText>
        </View>
        <Image source={{ uri: event.image_url }} style={styles.image} />
        {event.is_paid ? (
          <View style={styles.paidTag}>
            <CustomText style={styles.paidText}>$ Paid</CustomText>
          </View>
        ) : (
          <View style={styles.freeTag}>
            <CustomText style={styles.freeText}>$ Free</CustomText>
          </View>
        )}
        <View style={styles.contentContainer}>
          <View style={styles.timeContainer}>
            <View style={styles.timeUntilContainer}>
              <CustomText style={styles.timeUntilText}>{timeUntil}</CustomText>
            </View>
            <CustomText style={styles.timeLocationText}>{formattedTime} • {event.location}</CustomText>
          </View>
          <CustomText style={styles.title} numberOfLines={2}>{event.title}</CustomText>
          <CustomText style={styles.organizer}>{event.organizer}</CustomText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: -10
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10
  },
  dateContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#fff',
    paddingTop: 3,
    paddingBottom: 3,
    zIndex: 1,
    alignItems: 'center',
    minWidth: 52,
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 4
  },
  month: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colorFontDark,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  day: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colorFontLight,
    backgroundColor: theme.colorFontDark,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 1
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 18
  },
  paidTag: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: theme.colorExclusivePink,
    borderRadius: 24,
    paddingHorizontal: 12,
  },
  paidText: {
    color: theme.colorFontDark,
    fontSize: 13,
    fontWeight: 'bold',
  },
  freeTag: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: theme.colorExclusiveYellow,
    borderRadius: 24,
    paddingHorizontal: 12,
  },
  freeText: {
    color: theme.colorFontDark,
    fontSize: 13,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 10,
  },
  timeContainer: {
    marginBottom: 8,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  timeUntilContainer: {
    backgroundColor: theme.colorRichBlue,
    alignSelf: 'flex-start',
    borderRadius: 24,
    paddingVertical: 2,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  timeUntilText: {
    color: theme.colorFontLight,
    fontSize: 12,
  },
  timeLocationText: {
    color: theme.colorTaskbarYellow,
    fontSize: 14,
    padding: 2,
  },
  title: {
    color: theme.colorFontLight,
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  organizer: {
    color: theme.colorFontGray,
    fontSize: 13,
  },
});
