import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import CustomText from './CustomText';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

interface EventAPI {
  id: number;
  title: string;
  organizer: string;
  event_date: string;  // Example: "2025-03-15"
  event_time: string;  // Example: "09:30:00"
  location: string;
  image_url: string;
  is_paid?: boolean;
  created_by_email: string;
  created_at: string;
};

interface EventCardProps {
  event: EventAPI;
};

export const getMonthAndDay = (dateString: string) => {
  const date = new Date(dateString);
  return {
    month: date.toLocaleString('default', { month: 'short' }),
    day: date.getDate().toString().padStart(2, '0')
  };
};

export const calculateTimeUntil = (eventDate: string, eventTime: string) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const [year, month, day] = eventDate.split("-").map(Number);

  const eventDateTime = new Date(year, month - 1, day);
  eventDateTime.setHours(0, 0, 0, 0);

  const diffDays = Math.round((eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < -1) return "Event Ended";
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays} days left`;
};

export const formatTime = (timeString: string) => {
  if (!timeString) return '00:00';

  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);

    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
  } catch {
    return '00:00';
  };
};

const EventCardComponent = ({ event }: EventCardProps) => {
  const [timeUntil, setTimeUntil] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const checkEventStatus = () => {
      setTimeUntil(calculateTimeUntil(event.event_date, event.event_time));
    };

    checkEventStatus();

    const timer = setInterval(checkEventStatus, 60000);

    return () => clearInterval(timer);
  }, [event.event_date, event.event_time]);

  const date = getMonthAndDay(event.event_date);
  const formattedTime = formatTime(event.event_time);

  return (
    <View style={styles.card}>
      <View style={styles.dateContainer}>
        <CustomText style={styles.month} bold>{date.month}</CustomText>
        <CustomText style={styles.day} bold>{date.day}</CustomText>
      </View>
      <View style={styles.imageWrapper}>
        {!isImageLoaded && (
          <ShimmerPlaceholder
            // @ts-ignore
            testID="shimmer-placeholder"
            style={styles.skeletonImage}
            LinearGradient={LinearGradient}
            shimmerColors={['#333', '#444', '#333']}
          />
        )}
        <Image
          testID="event-image"
          source={{ uri: event.image_url }}
          alt='Event Image'
          style={isImageLoaded ? styles.image : styles.hiddenImage}
          onLoad={() => setIsImageLoaded(true)}
          onError={(e) => {
            console.log("Image load error for event ", event.id, " : ", e.nativeEvent.error);
            setIsImageLoaded(true);
          }}
        />
      </View>

      <View style={[styles.eventTypeTag, event.is_paid ? styles.eventPaid : styles.eventFree]}>
        <CustomText style={styles.eventTypeText} bold>$ {event.is_paid ? "Paid" : "Free"}</CustomText>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.timeContainer}>
          <View style={styles.timeUntilContainer}>
            <CustomText style={styles.timeUntilText}>{timeUntil}</CustomText>
          </View>
          <CustomText style={styles.timeLocationText}>{formattedTime}  •  {event.location}</CustomText>
        </View>
        <CustomText style={styles.title} numberOfLines={2}>{event.title}</CustomText>
        <CustomText style={styles.organizer}>{event.organizer}</CustomText>
      </View>
    </View>
  );
};

function areEventsEqual(prev: EventCardProps, next: EventCardProps) {
  return JSON.stringify(prev.event) === JSON.stringify(next.event);
};

export const EventCard = React.memo(EventCardComponent, areEventsEqual);

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  dateContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: theme.colorFontLight,
    paddingTop: 2,
    paddingBottom: 4,
    zIndex: 1,
    alignItems: 'center',
    minWidth: 52,
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingHorizontal: 4
  },
  month: {
    fontSize: 12.5,
    color: theme.colorFontDark,
    textTransform: 'uppercase',
    letterSpacing: 2
  },
  day: {
    fontSize: 16,
    color: theme.colorFontLight,
    backgroundColor: theme.colorBackgroundDark,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 200
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colorSlightDark,
    borderRadius: 18
  },
  hiddenImage: {
    width: '100%',
    height: 200,
    position: 'absolute',
    opacity: 0
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 18
  },
  eventPaid: {
    backgroundColor: theme.colorExclusivePink
  },
  eventFree: {
    backgroundColor: theme.colorExclusiveYellow
  },
  eventTypeTag: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 24,
    paddingHorizontal: 14
  },
  eventTypeText: {
    color: theme.colorFontDark,
    fontSize: 12
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingTop: 10
  },
  timeContainer: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  timeUntilContainer: {
    justifyContent: "center",
    backgroundColor: theme.colorRichBlue,
    borderRadius: 48,
    paddingHorizontal: 16
  },
  timeUntilText: {
    color: theme.colorFontLight,
    fontSize: 11
  },
  timeLocationText: {
    color: theme.colorLightGray,
    fontSize: 13,
    padding: 2
  },
  title: {
    color: theme.colorFontLight,
    fontSize: 14,
    lineHeight: 22
  },
  organizer: {
    color: theme.colorFontGray,
    fontSize: 12
  }
});
