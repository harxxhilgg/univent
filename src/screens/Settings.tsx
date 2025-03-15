import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import React, { useCallback, useContext, useRef, useState } from 'react';
import CustomText from '../components/CustomText';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { UserContext } from '../context/UserContext';
import { API_URL } from '../../univent-backend/src/utils/api';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Settings = () => {
  const { user } = useContext(UserContext);
  const accountSettingsBottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);

  const showToastLogoutSuccess = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 1500,
      type: 'success',
      text1: 'Logged out successfully!',
    });
  };

  const showToastLogoutFailure = (err: any) => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'error',
      text1: 'Log out failed!',
      text2: err || null,
    });
  };

  const showToastDeleteAccountSuccess = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'success',
      text1: 'Account deleted!'
    });
  };

  const showToastDeleteAccountFailure = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'error',
      text1: 'Account not deleted!',
    });
  };

  const somethingWentWrong = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'error',
      text1: 'Something went wrong!',
    });
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await AsyncStorage.removeItem("userToken");
      navigation.replace('Auth');
      showToastLogoutSuccess();
      setLogoutLoading(false);
    } catch (err) {
      console.error("Logout failed: ", err);
      setLogoutLoading(false);
      showToastLogoutFailure(err);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    setIsDeleteConfirmationVisible(false);
    try {
      const res = await fetch(`${API_URL}/auth/deleteAccount`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      if (res.ok) {
        await AsyncStorage.removeItem("userToken");
        showToastDeleteAccountSuccess();
        navigation.replace('Auth');
      } else {
        showToastDeleteAccountFailure();
      }
    } catch (err) {
      console.log("Account deletion failed: ", err);
      somethingWentWrong();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSheetChanges = useCallback((index: number) => {
    setIsBottomSheetOpen(index >= 0);
  }, []);

  const toggleBottomSheet = () => {
    if (isBottomSheetOpen) {
      accountSettingsBottomSheetRef.current?.close();
    } else {
      accountSettingsBottomSheetRef.current?.expand();
    };
  };

  const toggleDeleteConfirmation = () => {
    setIsDeleteConfirmationVisible((prev) => !prev);
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
          {user.email === 'user.guest@univent.com' ? (
            <View>{null}</View>
          ) : (
            <CustomText style={[styles.userDetails, styles.emailText]}>{user?.email || 'testemail@example.com'}</CustomText>
          )}
        </View>

        <TouchableOpacity
          style={styles.accountSettingsContainer}
          onPress={toggleBottomSheet}
        >
          <FontAwesome6 name="gear" size={24} color={theme.colorTaskbarYellow} />
          <CustomText style={styles.accountSettingsText}>Account Settings</CustomText>
        </TouchableOpacity>

        <BottomSheet
          ref={accountSettingsBottomSheetRef}
          index={-1}
          enablePanDownToClose={true}
          snapPoints={['50%']}
          onChange={handleSheetChanges}
          backgroundStyle={{ backgroundColor: theme.colorSlightDark }}
          handleIndicatorStyle={{ backgroundColor: theme.colorTaskbarYellow, width: "20%", marginTop: 4 }}
        >
          <BottomSheetView style={styles.bottomSheetContainer}>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? (
                <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
              ) : (
                <CustomText style={styles.logoutBtnText}>Log out</CustomText>
              )}
            </TouchableOpacity>

            {user?.email === "user.guest@univent.com" ? (
              <View>{null}</View>
            ) : (
              <TouchableOpacity
                style={styles.deleteAccountBtn}
                onPress={toggleDeleteConfirmation}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                ) : (
                  <CustomText style={styles.deleteAccountBtnText}>Delete Account</CustomText>
                )}
              </TouchableOpacity>
            )}


          </BottomSheetView>
        </BottomSheet>
      </ScrollView>

      {isDeleteConfirmationVisible && (
        <View style={styles.overlay}>
          <View style={styles.confirmationContainer}>
            <CustomText style={styles.confirmationTitle}>Delete Account</CustomText>
            <CustomText style={styles.confirmationMessage}>
              Are you sure you want to delete your account? This action cannot be undone.
            </CustomText>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.cancelButton]}
                onPress={toggleDeleteConfirmation}
              >
                <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
              >
                <CustomText style={styles.deleteButtonText}>Delete</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark,
    paddingBottom: 30,
  },
  userDataContainer: {
    backgroundColor: theme.colorSlightDark,
    width: "90%",
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 28,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: "10%",
  },
  userDetails: {
    color: theme.colorFontLight,
  },
  userProfile: {
    resizeMode: 'cover',
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  usernameText: {
    fontSize: 26,
    fontWeight: "bold",
  },
  emailText: {
    marginTop: 2,
    fontSize: 16,
  },
  logoutBtn: {
    alignSelf: "center",
    width: "95%",
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
    backgroundColor: theme.colorTaskbarYellow,
    boxShadow: "0px 0px 30px #faf0cc50",
    borderRadius: 20,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
  },
  logoutBtnText: {
    color: theme.colorFontDark,
    textAlign: "center",
    fontWeight: 'bold',
  },
  deleteAccountBtn: {
    alignSelf: "center",
    width: "95%",
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
    backgroundColor: theme.colorRed,
    boxShadow: "0px 0px 30px #d9303550",
    borderRadius: 20,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  deleteAccountBtnText: {
    color: theme.colorFontLight,
    textAlign: "center",
    fontWeight: 'bold',
  },
  activityIndicator: {
    paddingVertical: 4,
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: theme.colorSlightDark,
    padding: 16,
  },
  accountSettingsContainer: {
    backgroundColor: theme.colorSlightDark,
    width: "90%",
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 48,
    marginTop: 20,
    gap: 14,
  },
  accountSettingsText: {
    color: theme.colorFontLight,
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmationContainer: {
    backgroundColor: theme.colorSlightDark,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "80%",
    maxWidth: 300,
    alignItems: 'center',
    borderWidth: 1,
  },
  confirmationTitle: {
    color: theme.colorFontLight,
    fontSize: 22,
    fontWeight: 'bold',
  },
  confirmationMessage: {
    color: theme.colorFontLight,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colorTaskbarYellow,
    boxShadow: "0px 0px 30px #faf0cc60",
  },
  deleteButton: {
    backgroundColor: theme.colorRed,
    boxShadow: "0px 0px 30px #d9303560",
  },
  cancelButtonText: {
    color: theme.colorFontDark,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: theme.colorFontLight,
    fontWeight: 'bold',
  },
});