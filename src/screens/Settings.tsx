import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import CustomText from '../components/CustomText'
import { theme } from '../../theme'
import { useNavigation } from '@react-navigation/native'
import { AuthScreenNavigationProp } from '../../App'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { UserContext } from '../context/UserContext'

const Settings = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  const showToastLogoutSuccess = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 1500,
      type: 'success',
      text1: 'Logged out successfully!'
    });
  };

  const showToastLogoutFailure = (err: any) => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'error',
      text1: 'Log out failed!',
      text2: err || null
    });
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem("userToken");
      navigation.replace('Auth');
      showToastLogoutSuccess();
      setLoading(false);
    } catch (err) {
      console.error("Logout failed: ", err);
      setLoading(false);
      showToastLogoutFailure(err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.userDataContainer}>
          <Image source={require('../../assets/logos/userProfile.png')} style={styles.userProfile} />
          <CustomText style={[styles.userDetails, styles.usernameText]}>{user?.username || 'User Name'}</CustomText>
          <CustomText style={[styles.userDetails, styles.emailText]}>{user?.email || 'testemail@example.com'}</CustomText>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
          ) : (
            <CustomText style={styles.logoutBtnText}>Log out</CustomText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Settings

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark,
    paddingBottom: 30
  },
  userDataContainer: {
    backgroundColor: theme.colorSlightDark,
    width: "80%",
    paddingVertical: 28,
    paddingHorizontal: 28,
    gap: 10,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: "10%"
  },
  userDetails: {
    color: theme.colorFontLight
  },
  userProfile: {
    resizeMode: 'cover',
    width: 150,
    height: 150,
  },
  usernameText: {
    fontSize: 24
  },
  emailText: {
    fontSize: 16
  },
  logoutBtn: {
    marginTop: "auto",
    marginBottom: "25%",
    paddingVertical: 6,
    backgroundColor: theme.colorTaskbarYellow,
    borderRadius: 20,
    width: "85%"
  },
  logoutBtnText: {
    color: theme.colorFontDark,
    textAlign: "center",
    fontWeight: '700'
  },
  activityIndicator: {
    paddingVertical: 4
  },
  fontWhite: {
    color: theme.colorFontLight
  }
})