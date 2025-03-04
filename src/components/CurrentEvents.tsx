import { View, Image, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import CustomText from './CustomText';
import { useEffect, useState } from 'react';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

interface EventAPI {
  id: number;
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:MM:SS
  location: string;
  title: string;
  organizer: string;
  image_url: string;
  is_paid?: boolean;
}

interface CurrentEventsProps {
  event: EventAPI;
  hideEndedEvents?: boolean;
}

const isEventHappeningNow = (eventDate: string, eventTime: string) => {
  const now = new Date();
  const [hours, minutes, seconds] = eventTime.split(':').map(Number);

  // Create event start time in local time
  const eventStart = new Date(eventDate);
  eventStart.setHours(hours, minutes, seconds, 0);

  // Calculate event end time (start + 2 hours)
  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventStart.getHours() + 2);

  // Check if current time is within event start and end
  return now >= eventStart && now <= eventEnd;
};

const hasEventEnded = (eventDate: string, eventTime: string) => {
  const now = new Date();
  const [hours, minutes, seconds] = eventTime.split(':').map(Number);

  const eventStart = new Date(eventDate);
  eventStart.setHours(hours, minutes, seconds, 0);

  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventStart.getHours() + 2);

  return now > eventEnd;
};

const formatTime = (timeString: string, eventDate: string) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date(eventDate);
  date.setHours(parseInt(hours), parseInt(minutes), 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
};

export default function CurrentEvents({ event, hideEndedEvents = true }: CurrentEventsProps) {
  const [isHappeningNow, setIsHappeningNow] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const checkEventStatus = () => {
      const ended = hasEventEnded(event.event_date, event.event_time);
      setIsEnded(ended);

      if (isEventHappeningNow(event.event_date, event.event_time)) {
        setIsHappeningNow(true);
      } else {
        setIsHappeningNow(false);
      }
    };

    checkEventStatus();
    const timer = setInterval(checkEventStatus, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [event.event_date, event.event_time]);

  if ((hideEndedEvents && isEnded) || !isHappeningNow) {
    return null;
  }

  const formattedTime = formatTime(event.event_time, event.event_date);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
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
                console.log('Image load error for event ', event.id, ' : ', e.nativeEvent.error);
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
              console.log('Image load error for event ', event.id, ' : ', e.nativeEvent.error);
              setIsImageLoaded(true);
            }}
          />
        )}

        {event.is_paid ? (
          <View style={styles.paidTag}>
            <CustomText style={styles.paidText}>Paid</CustomText>
          </View>
        ) : (
          <View style={styles.freeTag}>
            <CustomText style={styles.freeText}>Free</CustomText>
          </View>
        )}
        <View style={styles.contentContainer}>
          <View style={styles.timeContainer}>
            {isHappeningNow && (
              <View style={styles.timeUntilContainer}>
                <CustomText style={styles.timeUntilText}>Happening Now</CustomText>
              </View>
            )}
            <CustomText style={styles.timeLocationText}>
              {formattedTime} • {event.location}
            </CustomText>
          </View>
          <CustomText style={styles.title} numberOfLines={2}>{event.title}</CustomText>
          <CustomText style={styles.organizer} numberOfLines={2}>{event.organizer}</CustomText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
  },
  card: {
    width: 290,
    overflow: 'hidden',
    padding: 10,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  skeletonImage: {
    width: '100%',
    height: 140,
    backgroundColor: theme.colorSlightDark,
    borderRadius: 18,
  },
  hiddenImage: {
    width: '100%',
    height: 140,
    position: 'absolute',
    opacity: 0,
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    borderRadius: 24,
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
    fontSize: 10,
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
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 10,
  },
  timeContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeUntilContainer: {
    backgroundColor: theme.colorRed,
    alignSelf: 'flex-start',
    borderRadius: 24,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  timeUntilText: {
    color: theme.colorFontLight,
    fontSize: 11,
  },
  timeLocationText: {
    color: theme.colorTaskbarYellow,
    fontSize: 12,
    padding: 1,
  },
  title: {
    color: theme.colorFontLight,
    fontSize: 14,
    marginBottom: 1,
    lineHeight: 18,
  },
  organizer: {
    color: theme.colorFontGray,
    fontSize: 11.5,
  },
});