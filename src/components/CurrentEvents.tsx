import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';
import CustomText from './CustomText';

const { width } = Dimensions.get('window');

interface EventCardProps {
  time: string;
  location: string;
  title: string;
  organizer: string;
  imageUrl: string;
  isPaid?: boolean;
}

export default function CurrentEvents({
  time,
  location,
  title,
  organizer,
  imageUrl,
  isPaid = false,
}: EventCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        {isPaid ? (
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
            <View style={styles.timeUntilContainer}>
              <CustomText style={styles.timeUntilText}>Going on</CustomText>
            </View>
            <CustomText style={styles.timeLocationText}>{time} • {location}</CustomText>
          </View>
          <CustomText style={styles.title} numberOfLines={2}>{title}</CustomText>
          <CustomText style={styles.organizer} numberOfLines={2}>{organizer}</CustomText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginRight: width > 450 ? -185 : -155,
  },
  card: {
    width: "65%",
    overflow: 'hidden',
    padding: 10,
  },
  image: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
    borderRadius: 24
  },

  // change this later
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
    flexDirection: "row",
    justifyContent: "space-between"
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
    lineHeight: 18
  },
  organizer: {
    color: theme.colorFontGray,
    fontSize: 11.5,
  },
});
