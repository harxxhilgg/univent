import { View, Image, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import CustomText from './CustomText';
import { useState } from 'react';
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
  event: EventAPI
}

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

export default function CurrentEvents({ event }: CurrentEventsProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const formattedTime = formatTime(event.event_time, event.event_date);

  return (
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

      <View style={[styles.eventTypeTag, event.is_paid ? styles.eventPaid : styles.eventFree]}>
        <CustomText style={styles.eventTypeText} bold>{event.is_paid ? "Paid" : "Free"}</CustomText>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.timeContainer}>
          <View style={styles.timeUntilContainer}>
            <CustomText style={styles.timeUntilText} bold>Going on</CustomText>
          </View>
          <CustomText style={styles.timeLocationText}>
            {formattedTime} • {event.location}
          </CustomText>
        </View>
        <CustomText style={styles.title} numberOfLines={2}>{event.title}</CustomText>
        <CustomText style={styles.organizer} numberOfLines={1}>{event.organizer}</CustomText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 290,
    padding: 10
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 140
  },
  skeletonImage: {
    width: '100%',
    height: 140,
    backgroundColor: theme.colorSlightDark,
    borderRadius: 24
  },
  hiddenImage: {
    width: '100%',
    height: 140,
    position: 'absolute',
    opacity: 0
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
    borderRadius: 24
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
    paddingHorizontal: 12
  },
  eventTypeText: {
    color: theme.colorFontDark,
    fontSize: 10
  },
  contentContainer: {
    padding: 10
  },
  timeContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    gap: 10
  },
  timeUntilContainer: {
    backgroundColor: theme.colorRed,
    alignSelf: 'flex-start',
    borderRadius: 24,
    paddingHorizontal: 10,
    marginBottom: 4
  },
  timeUntilText: {
    color: theme.colorFontLight,
    fontSize: 11
  },
  timeLocationText: {
    color: theme.colorTaskbarYellow,
    fontSize: 12,
    padding: 1
  },
  title: {
    color: theme.colorFontLight,
    fontSize: 14,
    lineHeight: 18
  },
  organizer: {
    color: theme.colorFontGray,
    fontSize: 12
  },
});