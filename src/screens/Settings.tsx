import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { TextInput as TextInputPaper } from 'react-native-paper';
import * as Animatable from 'react-native-animatable'
import { useToast } from '../components/useToast';

const Settings = () => {
  const { user, setUser } = useContext(UserContext);
  const accountSettingsBottomSheetRef = useRef<BottomSheet>(null);
  const profileSettingsBottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isBottomSheetAccountOpen, setIsBottomSheetAccountOpen] = useState(false);
  const [isBottomSheetProfileOpen, setIsBottomSheetProfileOpen] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [isEditAccDetailsLayoutVisible, setIsEditAccDetailsLayoutVisible] = useState(false);
  const [username, setUsername] = useState(user?.username || "username");
  const [email, setEmail] = useState(user?.email || "email");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { showSuccess, showError } = useToast();
  const [countdown, setCountdown] = useState(10);
  const [canDelete, setCanDelete] = useState(false);
  const [animation] = useState('lightSpeedIn');

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await AsyncStorage.removeItem("authToken");
      navigation.replace('Auth');
      showSuccess(1500, 'Logged out successfully!');
      setLogoutLoading(false);
    } catch (err) {
      console.error("Logout failed: ", err);
      setLogoutLoading(false);
      showError(2000, 'Logout failed!', 'Try again later.');
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
        showSuccess(2000, 'Your account has been permanently deleted.');
        navigation.replace('Auth');
      } else {
        showError(2000, 'Account not deleted!');
      }
    } catch (err) {
      console.log("Account deletion failed: ", err);
      showError(2000, 'Something went wrong!');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAccountSheetChanges = useCallback((index: number) => {
    setIsBottomSheetAccountOpen(index >= 0);
  }, []);

  const handleProfileSheetChanges = useCallback((index: number) => {
    setIsBottomSheetProfileOpen(index >= 0);
  }, []);

  const toggleBottomProfileSheet = () => {
    if (isBottomSheetAccountOpen) accountSettingsBottomSheetRef.current?.close();

    if (isBottomSheetProfileOpen) {
      profileSettingsBottomSheetRef.current?.close();
    } else {
      profileSettingsBottomSheetRef.current?.expand();
    };
  };

  const toggleBottomAccountSheet = () => {
    if (isBottomSheetProfileOpen) profileSettingsBottomSheetRef.current?.close();

    if (isBottomSheetAccountOpen) {
      accountSettingsBottomSheetRef.current?.close();
    } else {
      accountSettingsBottomSheetRef.current?.expand();
    };
  };

  const toggleDeleteConfirmation = () => {
    setIsDeleteConfirmationVisible((prev) => !prev);
  };

  const toggleEditLayout = () => {
    setIsEditAccDetailsLayoutVisible((prev) => !prev);
  };

  const validateUsername = (username: string) => {
    const regex = /^[a-z0-9._]+$/;
    return regex.test(username);
  };

  const handleUsernameChange = (username: string) => {
    const isValidUsername = validateUsername(username);
    const isLengthValid = username.length >= 7;

    setUsername(username);

    if (!isValidUsername) {
      setIsValid(false);
      setErrorMessage("username can only contain lowercase letters, numbers, '.' and '_'");
    } else if (!isLengthValid) {
      setIsValid(false);
      setErrorMessage("username must be at least 7 characters long.");
    } else {
      setIsValid(true);
      setErrorMessage("");
    };
  };

  const handleEditAccount = async () => {
    if (!isValid) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: errorMessage });
      return;
    };

    try {
      const res = await fetch(`${API_URL}/auth/updateProfile`, {
        method: 'PUT',
        headers: { 'Content-Type': "applicatoin/json" },
        body: JSON.stringify({ id: user.id, username, email })
      });

      if (res.ok) {
        const updateUser = await res.json();
        setUser(updateUser);
        Toast.show({ type: 'success', text1: 'Profile Upated!' });
        setIsEditAccDetailsLayoutVisible(false);
      } else {
        Toast.show({ type: 'error', text1: 'Update Failed' });
      }
    } catch (error) {
      console.error("Update error: ", error);
      Toast.show({ type: 'error', text1: 'Something went wrong.' });
    }
  };

  useEffect(() => {
    let timer: any;

    if (isDeleteConfirmationVisible) {
      setCountdown(10);
      setCanDelete(false);

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanDelete(true);
            return 0;
          }
          return prev - 1;
        })
      }, 1000);
    };

    return () => clearInterval(timer);
  }, [isDeleteConfirmationVisible]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.userDataContainer}>
            {user?.email === "user.guest@univent.com" ? (
              <View>{null}</View>
            ) : (
              <TouchableOpacity
                style={styles.editAccountContainer}
                onPress={toggleEditLayout}
              >
                <MaterialCommunityIcons name="account-edit" size={28} color={theme.colorFontGray} />
              </TouchableOpacity>
            )}
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
            onPress={toggleBottomProfileSheet}
          >
            <FontAwesome6 name="user-pen" size={20} color={theme.colorTaskbarYellow} style={styles.heroImage} />
            <CustomText style={styles.accountSettingsText}>Profile Settings</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountSettingsContainer}
            onPress={toggleBottomAccountSheet}
          >
            <FontAwesome6 name="gear" size={22} color={theme.colorTaskbarYellow} style={styles.heroImage} />
            <CustomText style={styles.accountSettingsText}>Account Settings</CustomText>
          </TouchableOpacity>

          <BottomSheet
            ref={profileSettingsBottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={Platform.OS === 'web' ? ['30%'] : ['40%']}
            onChange={handleProfileSheetChanges}
            backgroundStyle={{ backgroundColor: theme.colorSlightDark, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: theme.colorTaskbarYellow, width: "20%", maxWidth: 100, marginTop: 4 }}
          >
            <BottomSheetView style={styles.bottomSheetContainer}>

              {user?.email === "user.guest@univent.com" ? (
                <View>{null}</View>
              ) : (
                <TouchableOpacity
                  style={styles.editAccBtn}
                  onPress={toggleEditLayout}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                  ) : (
                    <CustomText style={styles.editAccBtnText}>Edit Profile</CustomText>
                  )}
                </TouchableOpacity>
              )}

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

            </BottomSheetView>
          </BottomSheet>

          <BottomSheet
            ref={accountSettingsBottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={Platform.OS === 'web' ? ['30%'] : ['40%']}
            onChange={handleAccountSheetChanges}
            backgroundStyle={{ backgroundColor: theme.colorSlightDark, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: theme.colorTaskbarYellow, width: "20%", maxWidth: 100, marginTop: 4 }}
          >
            <BottomSheetView style={styles.bottomSheetContainer}>

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

          {isDeleteConfirmationVisible && (
            <View style={styles.DeleteAccountOverlay}>
              <Animatable.View style={styles.DeleteAccountConfirmationContainer} animation={animation} duration={200}>
                <CustomText style={styles.DeleteAccountConfirmationTitle}>Delete Account?</CustomText>
                <CustomText style={styles.DeleteAccountConfirmationMessage}>
                  Deleting this account will permanently remove it from Univnet. This action cannot be undone.
                </CustomText>
                <View style={styles.DeleteAccountButtonContainer}>
                  <TouchableOpacity
                    style={[styles.DeleteAccountConfirmationButton, styles.DeleteAccountCancelButton]}
                    onPress={toggleDeleteConfirmation}
                  >
                    <CustomText style={styles.DeleteAccountCancelButtonText}>Cancel</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.DeleteAccountConfirmationButton,
                      styles.DeleteAccountDeleteButton,
                      !canDelete && { opacity: 0.5 }
                    ]}
                    onPress={handleDeleteAccount}
                    disabled={!canDelete}
                  >
                    <CustomText style={styles.DeleteAccountDeleteButtonText}>
                      {canDelete ? 'Yes, Delete' : countdown}
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            </View>
          )}

          {isEditAccDetailsLayoutVisible && (
            <View style={styles.EditAccountOverlay}>
              <Animatable.View style={styles.EditAccountConfirmationContainer} animation={animation} duration={300}>
                <View style={styles.EditAccountTitleContainer}>
                  <CustomText style={styles.editAccountConfirmationTitle}>Edit Account</CustomText>
                </View>
                <TouchableOpacity style={styles.editAccountLayoutCloseIcon} onPress={toggleEditLayout}>
                  <MaterialCommunityIcons name="close" size={24} color={theme.colorFontGray} />
                </TouchableOpacity>
                <View style={styles.editAccountInputContainer}>
                  <TextInputPaper
                    keyboardType="default"
                    autoCapitalize='none'
                    label="username"
                    value={username}
                    onChangeText={handleUsernameChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={styles.inputField}
                    mode="outlined"
                    theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorSlightDark } }}
                    textColor={theme.colorFontLight}
                    outlineStyle={{ borderRadius: 10 }}
                  />
                  {!isValid && (
                    <CustomText style={styles.errorUsernameText}>{errorMessage}</CustomText>
                  )}
                  <TextInputPaper
                    keyboardType="email-address"
                    autoCapitalize='none'
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={styles.inputField}
                    mode="outlined"
                    theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorSlightDark } }}
                    textColor={theme.colorFontLight}
                    outlineStyle={{ borderRadius: 10 }}
                  />
                </View>
                <TouchableOpacity style={styles.editAccountSubmitButton} onPress={handleEditAccount}>
                  <CustomText style={styles.editAccountSubmitButtonText}>Save Changes</CustomText>
                </TouchableOpacity>
              </Animatable.View>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark
  },
  userDataContainer: {
    backgroundColor: theme.colorSlightDark,
    width: "90%",
    maxWidth: 500,
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 28,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 50 : 10
  },
  editAccountContainer: {
    position: "absolute",
    top: 12,
    right: 12
  },
  userDetails: {
    color: theme.colorFontLight,
  },
  userProfile: {
    resizeMode: 'cover',
    width: 150,
    height: 150,
    marginBottom: 10
  },
  usernameText: {
    fontSize: 26,
    fontWeight: "bold"
  },
  emailText: {
    fontSize: 13
  },
  editAccBtn: {
    alignSelf: "center",
    width: "95%",
    maxWidth: 400,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
    backgroundColor: theme.colorLightGray,
    boxShadow: "0px 0px 30px #090b1150",
    borderRadius: 20,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5
  },
  editAccBtnText: {
    color: theme.colorFontDark,
    textAlign: "center",
    fontWeight: 'bold'
  },
  logoutBtn: {
    alignSelf: "center",
    width: "95%",
    maxWidth: 400,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
    backgroundColor: theme.colorTaskbarYellow,
    boxShadow: "0px 0px 30px #faf0cc50",
    borderRadius: 20,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5
  },
  logoutBtnText: {
    color: theme.colorFontDark,
    textAlign: "center",
    fontWeight: 'bold'
  },
  deleteAccountBtn: {
    alignSelf: "center",
    width: "95%",
    maxWidth: 400,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
    backgroundColor: theme.colorRed,
    boxShadow: "0px 0px 30px #d9303550",
    borderRadius: 20,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10
  },
  deleteAccountBtnText: {
    color: theme.colorFontLight,
    textAlign: "center",
    fontWeight: 'bold'
  },
  activityIndicator: {
    paddingVertical: 4
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: theme.colorSlightDark,
    padding: 16
  },
  accountSettingsContainer: {
    backgroundColor: theme.colorSlightDark,
    width: "90%",
    maxWidth: 500,
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 48,
    marginTop: 20,
    gap: 14
  },
  heroImage: {
    width: 26,
    alignSelf: "center",
  },
  accountSettingsText: {
    color: theme.colorFontLight,
    fontSize: 16
  },
  DeleteAccountOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  DeleteAccountConfirmationContainer: {
    backgroundColor: theme.colorSlightDark,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 22,
    width: "90%",
    maxWidth: 350,
    alignItems: 'center',
    borderWidth: 1
  },
  DeleteAccountConfirmationTitle: {
    color: theme.colorFontLight,
    fontSize: 18,
    fontWeight: 'bold'
  },
  DeleteAccountConfirmationMessage: {
    color: theme.colorLightGray,
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 10,
    width: "90%"
  },
  DeleteAccountButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  DeleteAccountConfirmationButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  DeleteAccountCancelButton: {
    backgroundColor: theme.colorButtonGray,
    boxShadow: "0px 0px 30px #262626",
  },
  DeleteAccountDeleteButton: {
    backgroundColor: theme.colorRed,
    boxShadow: "0px 0px 30px #d9303560"
  },
  DeleteAccountCancelButtonText: {
    color: theme.colorWhite,
    fontWeight: 'bold'
  },
  DeleteAccountDeleteButtonText: {
    color: theme.colorFontLight,
    fontWeight: 'bold'
  },
  EditAccountOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  EditAccountConfirmationContainer: {
    backgroundColor: theme.colorSlightDark,
    borderRadius: 30,
    width: "90%",
    maxWidth: 350,
    alignItems: 'center'
  },
  EditAccountTitleContainer: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: theme.colorGray,
    paddingVertical: 12
  },
  editAccountConfirmationTitle: {
    color: theme.colorFontLight,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  editAccountLayoutCloseIcon: {
    position: "absolute",
    top: 15,
    right: 18
  },
  editAccountInputContainer: {
    width: '95%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  inputField: {
    color: theme.colorFontLight
  },
  errorUsernameText: {
    color: theme.colorRed,
    paddingHorizontal: 10,
    fontSize: 15
  },
  editAccountSubmitButton: {
    backgroundColor: theme.colorTaskbarYellow,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 6,
    boxShadow: "0px 0px 30px #faf0cc40"
  },
  editAccountSubmitButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16
  }
});