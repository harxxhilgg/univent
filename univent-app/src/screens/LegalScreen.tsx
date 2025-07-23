import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import { privacyPolicyText, termsOfServiceText } from '../configs/legalText';

const LegalScreen = ({ route }: { route: any }) => {
  const { type } = route.params;
  const isPrivacy = type === 'privacy';
  const content = isPrivacy ? privacyPolicyText : termsOfServiceText;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {content.map((item, index) => (
        <View key={index} style={styles.section}>
          <CustomText style={styles.title} bold>{item.title}</CustomText>
          <CustomText style={styles.body}>{item.body}</CustomText>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorBackgroundDark,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    color: theme.colorFontLight,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    color: theme.colorLightGray,
    lineHeight: 24,
  },
});

export default LegalScreen;