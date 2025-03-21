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
  hideEndedEvents?: boolean;
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

const isEventEnded = (eventDate: string, eventTime: string) => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (todayStr > eventDate) {
    return true;
  }
  if (todayStr < eventDate) {
    return false;
  }

  const [eventHours, eventMinutes, eventSeconds] = eventTime.split(":").map(Number);
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();

  return (
    currentHours > eventHours ||
    (currentHours === eventHours && currentMinutes < eventMinutes) ||
    (currentHours === eventHours && currentMinutes === eventMinutes && currentSeconds < eventSeconds)
  );
};

export const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));

  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  });
};

export default function EventCard({ event, hideEndedEvents = true }: EventCardProps) {
  const [timeUntil, setTimeUntil] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const checkEventStatus = () => {
      const ended = isEventEnded(event.event_date, event.event_time);
      setIsEnded(ended);
      setTimeUntil(calculateTimeUntil(event.event_date, event.event_time));
    };

    checkEventStatus();

    const timer = setInterval(checkEventStatus, 60000);

    return () => clearInterval(timer);
  }, [event.event_date, event.event_time]);

  if (hideEndedEvents && isEnded) {
    return null;
  }

  const date = getMonthAndDay(event.event_date);
  const formattedTime = formatTime(event.event_time);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.dateContainer}>
          <CustomText style={styles.month}>{date.month}</CustomText>
          <CustomText style={styles.day}>{date.day}</CustomText>
        </View>
        {!isImageLoaded ? (
          <View style={styles.imageWrapper}>
            <ShimmerPlaceholder
              style={styles.skeletonImage}
              LinearGradient={LinearGradient}
              shimmerColors={['#333', '#444', '#333']}
            />
            <Image
              source={{ uri: event.image_url }}
              style={styles.hiddenImage}
              onLoad={() => setIsImageLoaded(true)}
              onError={(e) => {
                console.log("Image load error for event ", event.id, " : ", e.nativeEvent.error);
                setIsImageLoaded(true);
              }}
            />
          </View>
        ) : (
          <Image
            source={{ uri: event.image_url }}
            style={styles.image}
            onLoad={() => setIsImageLoaded(true)}
            onError={(e) => {
              console.log("Image load error for event ", event.id, " : ", e.nativeEvent.error);
              setIsImageLoaded(true);
            }}
          />
        )
        }
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
    marginBottom: -15
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
    backgroundColor: theme.colorBackgroundDark,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
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
