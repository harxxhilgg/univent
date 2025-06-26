import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback, Linking } from 'react-native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import CustomText from '../components/CustomText';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';
import { api } from "../utils/api";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { TextInput as TextInputPaper, Modal as PaperModal } from 'react-native-paper';
import { useToast } from '../components/useToast';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const EditProfileSchema = z.object({
  username: z.string()
    .min(7, "Username must be at least 7 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-z0-9][a-z0-9._]*$/,
      "Username must start with a lowercase letter or number and contain only lowercase letters, numbers, dots (.) or underscores (_)"
    )
    .regex(/^(?!.*\.\.)/, "Username cannot contain consecutive dots")
    .regex(/^(?!.*\.$)/, "Username cannot end with a dot"),
  email: z.string().regex(
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    "Invalid email format — use only lowercase letters, numbers, dots, and standard email symbols"
  )
});

type FormData = z.infer<typeof EditProfileSchema>;

const Settings = () => {
  const { user, setUser } = useContext(UserContext);
  const accountSettingsBottomSheetRef = useRef<BottomSheet>(null);
  const profileSettingsBottomSheetRef = useRef<BottomSheet>(null);
  const miscellaneousSettingsBottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [isBottomSheetAccountOpen, setIsBottomSheetAccountOpen] = useState(false);
  const [isBottomSheetProfileOpen, setIsBottomSheetProfileOpen] = useState(false);
  const [isBottomSheetMiscellaneousOpen, setIsBottomSheetMiscellaneousOpen] = useState(false);
  const [isLogoutConfirmationVisible, setIsLogoutConfirmationVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [isEditAccDetailsLayoutVisible, setIsEditAccDetailsLayoutVisible] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [canDelete, setCanDelete] = useState(false);
  const { showSuccess, showError } = useToast();
  const buttonScale = useSharedValue(1);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    // watch // ! USE ONLY IN DEBUG
  } = useForm<FormData>({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || ''
    },
    mode: 'onChange'
  });

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
    setIsDeleteConfirmationVisible(false);
    try {
      setDeleteLoading(true);
      setDeleteAccountLoading(true);

      const res = await api.delete('/auth/deleteAccount', {
        data: { email: user.email }
      });

      if (res.status === 200) {
        await AsyncStorage.removeItem("authToken");
        showSuccess(3000, 'Your account has been permanently deleted.');
        navigation.replace('Auth');
      } else {
        showError(3000, 'Account not deleted!');
      };

    } catch (err) {
      console.error(err);
      showError(2000, 'Something went wrong!');
    } finally {
      setDeleteLoading(false);
      setDeleteAccountLoading(false);
    }
  };

  const openAppSettings = async () => {
    try {
      setNotificationLoading(true);
      await Linking.openSettings();
    } catch (error) {
      console.error('Failed to open app settings: ', error);
      showError(3000, 'There was an error opening app settings', 'Please try again');
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleAccountSheetChanges = useCallback((index: number) => {
    setIsBottomSheetAccountOpen(index >= 0);
  }, []);

  const handleProfileSheetChanges = useCallback((index: number) => {
    setIsBottomSheetProfileOpen(index >= 0);
  }, []);

  const handleMiscellaneousSheetChanges = useCallback((index: number) => {
    setIsBottomSheetMiscellaneousOpen(index >= 0);
  }, []);

  const bottomSheets = {
    profile: {
      ref: profileSettingsBottomSheetRef,
      isOpen: isBottomSheetProfileOpen
    },
    account: {
      ref: accountSettingsBottomSheetRef,
      isOpen: isBottomSheetAccountOpen
    },
    miscellaneous: {
      ref: miscellaneousSettingsBottomSheetRef,
      isOpen: isBottomSheetMiscellaneousOpen
    }
  };

  const toggleBottomSheet = (sheetType: keyof typeof bottomSheets) => {
    Object.values(bottomSheets).forEach(sheet => {
      sheet.ref.current?.close();
    });

    const selectedSheet = bottomSheets[sheetType];
    if (!selectedSheet.isOpen) {
      selectedSheet.ref.current?.expand();
    };
  };

  const toggleLogoutConfirmation = () => {
    setIsLogoutConfirmationVisible((prev) => !prev);
  };

  const toggleDeleteConfirmation = () => {
    setIsDeleteConfirmationVisible((prev) => !prev);
  };

  const toggleEditLayout = () => {
    setIsEditAccDetailsLayoutVisible((prev) => !prev);
  };

  const handleCloseEditAccountModal = () => {
    setIsEditAccDetailsLayoutVisible(false);
    reset({
      username: user?.username || '',
      email: user?.email || ''
    });
  };

  const onSubmit = (data: FormData) => {
    handleEditAccount(data);
  };

  const handleEditAccount = async (data: FormData) => {
    try {

      const response = await api.put('/auth/updateProfile', {
        id: user.id,
        username: data.username,
        email: data.email
      });

      if (response.status === 200) {
        const updateUser = response.data;
        setUser(updateUser);
        showSuccess(3000, 'Profile Updated');
        handleCloseEditAccountModal();
      } else {
        showError(3000, "Profile Update Failed");
      };

    } catch (error) {
      console.error("Update error: ", error);
      showError(3000, "Something went wrong", "Please try again");
    }
  };

  const animatedButtonStyles = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.98, {
      damping: 10,
      stiffness: 500
    });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, {
      damping: 10,
      stiffness: 500
    });
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

  useEffect(() => {
    if (isEditAccDetailsLayoutVisible) {
      reset({
        username: user?.username || '',
        email: user?.email || ''
      });
    }
  }, [isEditAccDetailsLayoutVisible, reset, user?.username, user?.email]);

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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="account-edit" size={28} color={theme.colorFontGray} />
              </TouchableOpacity>
            )}
            <FontAwesome name="user-circle-o" size={130} color={theme.colorTransparentLightGray} style={styles.userProfile} />
            <CustomText style={[styles.userDetails, styles.usernameText]} bold>{user?.username || 'Username'}</CustomText>
            {user.email === 'user.guest@univent.com' ? (
              <View>{null}</View>
            ) : (
              <CustomText style={[styles.userDetails, styles.emailText]}>{user?.email || 'testemail@example.com'}</CustomText>
            )}
          </View>

          <TouchableOpacity
            style={styles.accountSettingsContainer}
            onPress={() => toggleBottomSheet('profile')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Animated.View style={animatedButtonStyles}>
              <CustomText style={styles.accountSettingsText}>Profile Settings</CustomText>
            </Animated.View>
          </TouchableOpacity>

          {user.email === "user.guest@univent.com" ? (
            <View>{null}</View>
          ) : (
            <TouchableOpacity
              style={styles.accountSettingsContainer}
              onPress={() => toggleBottomSheet('account')}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <Animated.View style={animatedButtonStyles}>
                <CustomText style={styles.accountSettingsText}>Account Settings</CustomText>
              </Animated.View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.accountSettingsContainer}
            onPress={() => toggleBottomSheet('miscellaneous')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Animated.View style={animatedButtonStyles}>
              <CustomText style={styles.accountSettingsText}>Miscellaneous Settings</CustomText>
            </Animated.View>
          </TouchableOpacity>

          <BottomSheet
            ref={profileSettingsBottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={Platform.OS === 'web' ? ['30%'] : ['40%']}
            onChange={handleProfileSheetChanges}
            backgroundStyle={{ backgroundColor: theme.colorSlightDark, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: theme.colorTransparentLightGray, width: 100, marginTop: 4 }}
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
                  <LinearGradient
                    colors={['rgb(210, 238, 255)', 'rgb(250, 250, 250)', 'rgb(210, 238, 255)']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBackground}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                    ) : (
                      <CustomText style={styles.editAccBtnText} semibold>Edit Profile</CustomText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={toggleLogoutConfirmation}
                disabled={logoutLoading}
              >
                <LinearGradient
                  colors={['rgb(255, 180, 180)', 'rgb(250, 250, 250)', 'rgb(255, 180, 180)']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBackground}
                >
                  {logoutLoading ? (
                    <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                  ) : (
                    <CustomText style={styles.logoutBtnText} semibold>Log out</CustomText>
                  )}
                </LinearGradient>
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
            handleIndicatorStyle={{ backgroundColor: theme.colorTransparentLightGray, width: 100, marginTop: 4 }}
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
                  <LinearGradient
                    colors={['rgb(255, 0, 0)', 'rgb(250, 0, 0)']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBackground}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                    ) : (
                      <CustomText style={styles.deleteAccountBtnText} bold>Delete Account</CustomText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </BottomSheetView>
          </BottomSheet>

          <BottomSheet
            ref={miscellaneousSettingsBottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={Platform.OS === 'web' ? ['30%'] : ['40%']}
            onChange={handleMiscellaneousSheetChanges}
            backgroundStyle={{ backgroundColor: theme.colorSlightDark, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: theme.colorTransparentLightGray, width: 100, marginTop: 4 }}
          >
            <BottomSheetView style={styles.bottomSheetContainer}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={openAppSettings}
                disabled={notificationLoading}
              >
                <LinearGradient
                  colors={['rgb(210, 238, 255)', 'rgb(250, 250, 250)', 'rgb(210, 238, 255)']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBackground}
                >
                  {notificationLoading ? (
                    <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                  ) : (
                    <CustomText style={styles.logoutBtnText} semibold>Notifications</CustomText>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </BottomSheetView>
          </BottomSheet>

          <PaperModal
            visible={isEditAccDetailsLayoutVisible}
            onDismiss={handleCloseEditAccountModal}
            dismissable={true}
            contentContainerStyle={styles.editAccountConfirmationContainer}
            theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.9)' } }}
          >
            <View style={styles.editAccountTitleContainer}>
              <CustomText style={styles.editAccountConfirmationTitle} semibold>Edit Account</CustomText>
            </View>
            <TouchableOpacity style={styles.editAccountLayoutCloseIcon} onPress={handleCloseEditAccountModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colorFontGray} />
            </TouchableOpacity>
            <View style={styles.editAccountInputContainer}>

              <Controller
                name="username"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInputPaper
                      label="Username"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={!!errors.username}
                      style={styles.input}
                      mode="outlined"
                      theme={{
                        colors: {
                          primary: theme.colorWhite,
                          background: theme.colorSlightDark
                        }
                      }}
                      textColor={theme.colorFontLight}
                      outlineStyle={{ borderRadius: 10 }}
                      autoCapitalize='none'
                    />
                    {errors.username && (
                      <CustomText style={styles.errorText}>
                        {errors.username.message}
                      </CustomText>
                    )}
                  </>
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInputPaper
                      label="Email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={!!errors.email}
                      keyboardType='email-address'
                      autoCapitalize='none'
                      style={styles.input}
                      mode="outlined"
                      theme={{
                        colors: {
                          primary: theme.colorWhite,
                          background: theme.colorSlightDark
                        }
                      }}
                      textColor={theme.colorFontLight}
                      outlineStyle={{ borderRadius: 10 }}
                    />
                    {errors.email && (
                      <CustomText style={styles.errorText}>
                        {errors.email.message}
                      </CustomText>
                    )}
                  </>
                )}
              />
            </View>
            {/* <View style={{ padding: 10 }}> // ! USE ONLY IN DEBUG
              <CustomText style={{ fontSize: 18, color: theme.colorFontLight, marginBottom: 4 }}>Debug Values</CustomText>
              <CustomText style={{ color: theme.colorFontLight }}>Current Values: {JSON.stringify(watch())}</CustomText>
              <CustomText style={{ color: theme.colorFontLight }}>Errors: {JSON.stringify(errors)}</CustomText>
            </View> */}
            <View style={styles.editAccountButtonContainer}>
              <TouchableOpacity
                style={[styles.editAccountCancelButton, styles.editAccountButton]}
                onPress={handleCloseEditAccountModal}
              >
                <CustomText style={styles.editAccountCancelButtonText} semibold>Cancel</CustomText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.editAccountSaveChangesButton, styles.editAccountButton]} onPress={() => handleSubmit(onSubmit)()}>
                <CustomText style={styles.editAccountSaveChangesButtonText} semibold>Save Changes</CustomText>
              </TouchableOpacity>
            </View>
          </PaperModal>

          <PaperModal
            visible={isLogoutConfirmationVisible}
            onDismiss={toggleLogoutConfirmation}
            dismissable={true}
            contentContainerStyle={styles.logoutAccountConfirmationContainer}
            theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.9)' } }}
          >
            <CustomText style={styles.logoutAccountConfirmationTitle} semibold>Log out of your Account?</CustomText>
            <CustomText style={styles.logoutAccountConfirmationMessage}>
              Logging out will securely end your current session. You can sign back in anytime to access your account.
            </CustomText>
            <View style={styles.logoutAccountButtonContainer}>
              <TouchableOpacity
                style={[styles.logoutAccountConfirmationButton, styles.logoutAccountCancelButton]}
                onPress={toggleLogoutConfirmation}
              >
                <CustomText style={styles.logoutAccountCancelButtonText} bold>Cancel</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logoutAccountConfirmationButton, styles.logoutAccountDeleteButton]}
                onPress={handleLogout}
              >
                <CustomText style={styles.logoutAccountDeleteButtonText} bold>Log out</CustomText>
              </TouchableOpacity>
            </View>
          </PaperModal>

          <PaperModal
            visible={isDeleteConfirmationVisible}
            onDismiss={toggleDeleteConfirmation}
            dismissable={true}
            contentContainerStyle={styles.deleteAccountConfirmationContainer}
            theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.9)' } }}
          >
            <CustomText style={styles.deleteAccountConfirmationTitle} bold>Delete Account?</CustomText>
            <CustomText style={styles.deleteAccountConfirmationMessage}>
              Deleting this account will permanently remove it from Univnet. This action cannot be undone.
            </CustomText>
            <View style={styles.deleteAccountButtonContainer}>
              <TouchableOpacity
                style={[styles.deleteAccountConfirmationButton, styles.deleteAccountCancelButton]}
                onPress={toggleDeleteConfirmation}
              >
                <CustomText style={styles.deleteAccountCancelButtonText} bold>Cancel</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteAccountConfirmationButton,
                  styles.deleteAccountDeleteButton,
                  !canDelete && { opacity: 0.3 }
                ]}
                onPress={handleDeleteAccount}
                disabled={!canDelete}
              >
                {deleteAccountLoading ? (
                  <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                ) : (
                  <CustomText style={styles.deleteAccountDeleteButtonText} bold>
                    {canDelete ? 'Yes, Delete' : countdown}
                  </CustomText>
                )}
              </TouchableOpacity>
            </View>
          </PaperModal>

        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: theme.colorBackgroundDark
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center"
  },
  userDataContainer: {
    backgroundColor: theme.colorSlightDark,
    width: "95%",
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
  userProfile: {
    marginBottom: 20
  },
  userDetails: {
    color: theme.colorFontLight,
  },
  usernameText: {
    fontSize: 26
  },
  emailText: {
    fontSize: 13
  },
  accountSettingsContainer: {
    backgroundColor: theme.colorSlightDark,
    width: "95%",
    maxWidth: 500,
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 48,
    marginTop: 16
  },
  accountSettingsText: {
    color: theme.colorFontLight,
    fontSize: 15.5
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: theme.colorSlightDark,
    padding: 16
  },
  gradientBackground: {
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center"
  },
  editAccBtn: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
    marginBottom: 10,
    elevation: 5
  },
  editAccBtnText: {
    color: theme.colorFontDark,
    textAlign: "center"
  },
  logoutBtn: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
    marginBottom: 10,
    elevation: 5
  },
  logoutBtnText: {
    color: theme.colorFontDark,
    textAlign: "center"
  },
  deleteAccountBtn: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
    marginBottom: 10
  },
  deleteAccountBtnText: {
    color: theme.colorFontLight,
    textAlign: "center"
  },
  activityIndicator: {
    paddingVertical: 4
  },
  editAccountConfirmationContainer: {
    backgroundColor: theme.colorSlightDark,
    borderRadius: 20,
    paddingBottom: 10,
    width: "85%",
    maxWidth: 380,
    alignItems: 'center',
    marginHorizontal: "auto"
  },
  editAccountTitleContainer: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: theme.colorGray,
    paddingVertical: 12
  },
  editAccountConfirmationTitle: {
    color: theme.colorFontLight,
    fontSize: 18,
    textAlign: 'center'
  },
  editAccountLayoutCloseIcon: {
    position: "absolute",
    top: 14,
    right: 15
  },
  editAccountInputContainer: {
    width: '90%',
    paddingTop: 10,
    gap: 8
  },
  input: {
    fontSize: 15
  },
  errorText: {
    color: theme.colorRed,
    paddingHorizontal: 10,
    fontSize: 13
  },
  editAccountButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    gap: 10,
    paddingVertical: 6
  },
  editAccountButton: {
    flex: 1,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 1,
    paddingVertical: 6,
    borderRadius: 12
  },
  editAccountCancelButton: {
    backgroundColor: theme.colorButtonGray
  },
  editAccountCancelButtonText: {
    color: theme.colorFontLight,
    fontSize: 14
  },
  editAccountSaveChangesButton: {
    backgroundColor: theme.colorRed
  },
  editAccountSaveChangesButtonText: {
    color: theme.colorFontLight,
    fontSize: 14
  },
  logoutAccountConfirmationContainer: {
    backgroundColor: theme.colorSlightDark,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 22,
    width: "90%",
    maxWidth: 350,
    alignItems: 'center',
    marginHorizontal: "auto"
  },
  logoutAccountConfirmationTitle: {
    color: theme.colorFontLight,
    fontSize: 18
  },
  logoutAccountConfirmationMessage: {
    color: theme.colorLightGray,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    width: "90%"
  },
  logoutAccountButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4
  },
  logoutAccountConfirmationButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  logoutAccountCancelButton: {
    backgroundColor: theme.colorButtonGray
  },
  logoutAccountDeleteButton: {
    backgroundColor: theme.colorRed
  },
  logoutAccountCancelButtonText: {
    fontSize: 14,
    color: theme.colorWhite
  },
  logoutAccountDeleteButtonText: {
    fontSize: 14,
    color: theme.colorFontLight
  },
  deleteAccountConfirmationContainer: {
    backgroundColor: theme.colorSlightDark,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 22,
    width: "90%",
    maxWidth: 350,
    alignItems: 'center',
    marginHorizontal: "auto"
  },
  deleteAccountConfirmationTitle: {
    color: theme.colorFontLight,
    fontSize: 18
  },
  deleteAccountConfirmationMessage: {
    color: theme.colorLightGray,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    width: "90%"
  },
  deleteAccountButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  deleteAccountConfirmationButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  deleteAccountCancelButton: {
    backgroundColor: theme.colorButtonGray
  },
  deleteAccountDeleteButton: {
    backgroundColor: theme.colorRed
  },
  deleteAccountCancelButtonText: {
    fontSize: 14,
    color: theme.colorWhite
  },
  deleteAccountDeleteButtonText: {
    fontSize: 14,
    color: theme.colorFontLight
  }
});