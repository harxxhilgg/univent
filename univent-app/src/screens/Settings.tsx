import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import CustomText from '../components/CustomText';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';
import { API_URL } from "../utils/api";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { TextInput as TextInputPaper, Modal as PaperModal } from 'react-native-paper';
import { useToast } from '../components/useToast';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isBottomSheetAccountOpen, setIsBottomSheetAccountOpen] = useState(false);
  const [isBottomSheetProfileOpen, setIsBottomSheetProfileOpen] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [isEditAccDetailsLayoutVisible, setIsEditAccDetailsLayoutVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [canDelete, setCanDelete] = useState(false);
  const { showSuccess, showError } = useToast();

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
    setDeleteLoading(true);

    setIsDeleteConfirmationVisible(false);
    try {
      const res = await fetch(`${API_URL}/auth/deleteAccount`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      if (res.ok) {
        await AsyncStorage.removeItem("authToken");
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
      const res = await fetch(`${API_URL}/auth/updateProfile`, {
        method: 'PUT',
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify({
          id: user.id,
          username: data.username,
          email: data.email
        })
      });

      if (res.ok) {
        const updateUser = await res.json();
        setUser(updateUser);
        showSuccess(2500, 'Profile Updated!');
        handleCloseEditAccountModal();
      } else {
        showError(2500, "Profile Update Failed!");
      }
    } catch (error) {
      console.error("Update error: ", error);
      showError(2500, "Something went wrong!", "Please try again.");
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
            <CustomText style={[styles.userDetails, styles.usernameText]} bold>{user?.username || 'User Name'}</CustomText>
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
            <CustomText style={styles.accountSettingsText}>Profile Settings</CustomText>
          </TouchableOpacity>

          {user.email === "user.guest@univent.com" ? (
            <View>{null}</View>
          ) : (
            <TouchableOpacity
              style={styles.accountSettingsContainer}
              onPress={toggleBottomAccountSheet}
            >
              <CustomText style={styles.accountSettingsText}>Account Settings</CustomText>
            </TouchableOpacity>
          )}

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
                onPress={handleLogout}
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
            visible={isDeleteConfirmationVisible}
            onDismiss={toggleDeleteConfirmation}
            dismissable={true}
            contentContainerStyle={styles.deleteAccountConfirmationContainer}
            theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.9)' } }}
          >
            <CustomText style={styles.deleteAccountConfirmationTitle}>Delete Account?</CustomText>
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
                <CustomText style={styles.deleteAccountDeleteButtonText} bold>
                  {canDelete ? 'Yes, Delete' : countdown}
                </CustomText>
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
    marginBottom: 20
  },
  usernameText: {
    fontSize: 26
  },
  emailText: {
    fontSize: 13
  },
  editAccBtn: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
    marginTop: 10,
    marginBottom: 10,
    elevation: 5
  },
  gradientBackground: {
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center"
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
    marginVertical: 10,
  },
  deleteAccountBtnText: {
    color: theme.colorFontLight,
    textAlign: "center"
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
    gap: 6
  },
  accountSettingsText: {
    color: theme.colorFontLight,
    fontSize: 15.5
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
    fontSize: 18,
    fontWeight: 'bold'
  },
  deleteAccountConfirmationMessage: {
    color: theme.colorLightGray,
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 10,
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
    paddingVertical: 8,
    borderRadius: 12
  },
  editAccountCancelButton: {
    backgroundColor: theme.colorButtonGray
  },
  editAccountCancelButtonText: {
    color: theme.colorFontLight
  },
  editAccountSaveChangesButton: {
    backgroundColor: theme.colorRed
  },
  editAccountSaveChangesButtonText: {
    color: theme.colorFontLight
  },
  errorUsernameText: {
    color: theme.colorRed,
    paddingHorizontal: 10,
    fontSize: 15
  },
  editAccountSubmitButton: {
    marginTop: 5,
    marginBottom: 10
  },
  saveChangesBtnGradient: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  editAccountSubmitButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16
  }
});