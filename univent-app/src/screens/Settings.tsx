import * as Haptics from "expo-haptics";
import CustomText from '../components/CustomText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedButton from '../components/AnimatedButton';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Constants from 'expo-constants';
import HapticsToggle from '../components/HapticsToggle';
import PressableScale from "../components/PressableScale";
import React, { useContext, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback, Linking, Text } from "react-native";
import { theme } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { UserContext } from "../context/UserContext";
import { api } from "../utils/api";
import { TextInput as TextInputPaper, Modal as PaperModal } from "react-native-paper";
import { useToast } from "../components/useToast";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StackNavigationProp } from "@react-navigation/stack";
import { conditionalHaptics } from "../utils/haptics";

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
  const aboutUsBottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [isLogoutConfirmationVisible, setIsLogoutConfirmationVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [isEditAccDetailsLayoutVisible, setIsEditAccDetailsLayoutVisible] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [openSheet, setOpenSheet] = useState<SheetType | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [canDelete, setCanDelete] = useState(false);
  const { showSuccess, showError } = useToast();

  type SheetType = keyof typeof sheetRefs;

  const sheetRefs = {
    profile: profileSettingsBottomSheetRef,
    account: accountSettingsBottomSheetRef,
    miscellaneous: miscellaneousSettingsBottomSheetRef,
    aboutus: aboutUsBottomSheetRef
  } as const;


  // data for about-us screen
  const aboutUsData = {
    name: "Univent",
    description: "Your ultimate companion for discovering and managing university events. Never miss out on what's happening on campus again.",
    createdBy: "Harshil",
    email: "harxxhil.gg@gmail.com"
  };

  // check if guest
  const isGuest = user?.email === 'user.guest@univent.com';

  const toggleBottomSheet = (type: SheetType) => {
    Object.values(sheetRefs).forEach(r => r.current?.close());
    setOpenSheet(type);
    requestAnimationFrame(() => sheetRefs[type].current?.expand());
  };

  const toggleSheetFromButton = (type: SheetType) => {
    if (openSheet === type) {
      sheetRefs[type].current?.close();
      setOpenSheet(null);
      return;
    }
    toggleBottomSheet(type);
  };

  const handleSheetChange = (type: SheetType) => (index: number) => {
    if (index === -1) setOpenSheet(prev => (prev === type ? null : prev));
    else setOpenSheet(type);
  };

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLogoutLoading(true);
    try {
      await AsyncStorage.removeItem("authToken");
      navigation.replace('Auth');
      showSuccess(1500, 'Logged out successfully!');
      setLogoutLoading(false);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Logout failed: ", err);
      setLogoutLoading(false);
      showError(2000, 'Logout failed!', 'Try again later.');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteConfirmationVisible(false);

    // show an early error if email is not available
    if (!user?.email) {
      showError(2000, 'No account found');
      return;
    }

    try {
      setDeleteAccountLoading(true);
      const res = await api.delete('/auth/deleteAccount', {
        data: { email: user.email }
      });

      if (res.status === 200) {
        await AsyncStorage.removeItem("authToken");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccess(3000, 'Your account has been permanently deleted.');
        navigation.replace('Auth');
      } else {
        showError(3000, 'Account not deleted!');
      };

    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error(err);
      showError(2000, 'Something went wrong!');
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const openAppSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
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

  const toggleLogoutConfirmation = () => {
    conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setIsLogoutConfirmationVisible((prev) => !prev);
  };

  const toggleDeleteConfirmation = () => {
    conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setIsDeleteConfirmationVisible((prev) => !prev);
  };

  const toggleEditLayout = () => {
    conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setIsEditAccDetailsLayoutVisible((prev) => !prev);
  };

  const handleCloseEditAccountModal = () => {
    conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccess(3000, 'Profile Updated');
        handleCloseEditAccountModal();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showError(3000, "Profile Update Failed");
      }
    } catch (error) {
      console.error("Update error: ", error);
      showError(3000, "Something went wrong", "Please try again");
    }
  };

  const handleProfileLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    try {
      await Linking.openURL("https://github.com/harxxhilgg");
    } catch (error) {
      console.error(`error opening github profile: ${error}`);
    };
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
            {!isGuest && (
              <PressableScale
                onPress={toggleEditLayout}
                pressedScale={0.90}
                style={styles.editAccountContainer}
              >
                <MaterialCommunityIcons name="account-edit" size={28} color={theme.colorFontGray} />
              </PressableScale>
            )}
            <FontAwesome name="user-circle-o" size={130} color={theme.colorTransparentLightGray} style={styles.userProfile} />
            <CustomText style={[styles.userDetails, styles.usernameText]} bold>{user?.username || 'Username'}</CustomText>
            {!isGuest && (
              <CustomText style={[styles.userDetails, styles.emailText]}>{user?.email || 'testemail@example.com'}</CustomText>
            )}
          </View>

          <PressableScale
            style={styles.accountSettingsContainer}
            onPress={() => {
              conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              toggleSheetFromButton('profile');
            }}
          >
            <CustomText style={styles.accountSettingsText}>Profile Settings</CustomText>
          </PressableScale>

          {!isGuest && (
            <PressableScale
              style={styles.accountSettingsContainer}
              onPress={() => {
                conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                toggleSheetFromButton('account');
              }}
            >
              <CustomText style={styles.accountSettingsText}>Account Settings</CustomText>
            </PressableScale>
          )}

          <PressableScale
            style={styles.accountSettingsContainer}
            onPress={() => {
              conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              toggleSheetFromButton('miscellaneous');
            }}
          >
            <CustomText style={styles.accountSettingsText}>Miscellaneous Settings</CustomText>
          </PressableScale>

          <PressableScale
            style={styles.accountSettingsContainer}
            onPress={() => {
              conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              toggleSheetFromButton('aboutus');
            }}
          >
            <CustomText style={styles.accountSettingsText}>About Us</CustomText>
          </PressableScale>

          <BottomSheet
            ref={profileSettingsBottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={Platform.OS === 'web' ? ['30%'] : ['40%']}
            onChange={handleSheetChange('profile')}
            backgroundStyle={{ backgroundColor: theme.colorBottomSheetDark, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: theme.colorTransparentLightGray, width: 100, marginTop: 4 }}
          >
            <BottomSheetView style={styles.bottomSheetContainer}>
              {!isGuest && (
                <AnimatedButton
                  label='Edit Profile'
                  onPress={toggleEditLayout}
                  variant='primary'
                  fullWidth
                  semibold
                  style={styles.bottomSheetButtonStyle}
                  textStyle={styles.buttonTextStyle}
                />
              )}
              <AnimatedButton
                label='Log Out'
                onPress={toggleLogoutConfirmation}
                loading={logoutLoading}
                disabled={logoutLoading}
                variant='danger'
                fullWidth
                semibold
                style={styles.bottomSheetButtonStyle}
                textStyle={styles.buttonTextStyle}
              />
            </BottomSheetView>
          </BottomSheet>

          <BottomSheet
            ref={accountSettingsBottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={Platform.OS === 'web' ? ['30%'] : ['40%']}
            onChange={handleSheetChange('account')}
            backgroundStyle={{ backgroundColor: theme.colorBottomSheetDark, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: theme.colorTransparentLightGray, width: 100, marginTop: 4 }}
          >
            <BottomSheetView style={styles.bottomSheetContainer}>
              {!isGuest && (
                <AnimatedButton
                  label='Delete Account'
                  onPress={toggleDeleteConfirmation}
                  variant='red'
                  fullWidth
                  semibold
                  style={styles.bottomSheetButtonStyle}
                  textStyle={styles.deleteAccountBtnText}
                />
              )}
            </BottomSheetView>
          </BottomSheet>

          <BottomSheet
            ref={miscellaneousSettingsBottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={Platform.OS === 'web' ? ['30%'] : ['40%']}
            onChange={handleSheetChange('miscellaneous')}
            backgroundStyle={{ backgroundColor: theme.colorBottomSheetDark, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: theme.colorTransparentLightGray, width: 100, marginTop: 4 }}
          >
            <BottomSheetView style={styles.bottomSheetContainer}>
              <AnimatedButton
                label='Notifications'
                onPress={openAppSettings}
                loading={notificationLoading}
                disabled={notificationLoading}
                variant='secondary'
                fullWidth
                semibold
                style={styles.bottomSheetButtonStyle}
                textStyle={styles.buttonTextStyle}
              />
              <HapticsToggle />
            </BottomSheetView>
          </BottomSheet>

          <BottomSheet
            ref={aboutUsBottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={['90%', '100%']}
            onChange={handleSheetChange('aboutus')}
            backgroundStyle={{ backgroundColor: theme.colorBottomSheetDark, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: theme.colorTransparentLightGray, width: 100, marginTop: 4 }}
          >
            <BottomSheetView style={styles.bottomSheetContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.aboutUsContainer}>
                  <View style={styles.aboutHeader}>
                    <Text style={styles.aboutLogo}>{aboutUsData.name}</Text>
                    <CustomText style={styles.aboutMission}>{aboutUsData.description}</CustomText>
                  </View>

                  <View style={styles.aboutSection}>
                    <CustomText style={styles.aboutSectionTitle} bold>App Version</CustomText>
                    <CustomText style={styles.aboutSectionVersion}>v{Constants.expoConfig?.version}</CustomText>
                  </View>

                  <View style={styles.aboutSection}>
                    <CustomText style={styles.aboutSectionTitle} bold>Created By</CustomText>
                    <PressableScale
                      onPress={handleProfileLink}
                      pressedScale={0.98}
                    >
                      <CustomText style={styles.aboutSectionContent}>{aboutUsData.createdBy}</CustomText>
                    </PressableScale>
                  </View>

                  <View style={styles.aboutSection}>
                    <CustomText style={styles.aboutSectionTitle} bold>Contact & Support</CustomText>
                    <PressableScale
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        Linking.openURL('mailto:harxxhil.gg@gmail.com');
                      }}
                      pressedScale={0.98}
                    >
                      <CustomText style={styles.aboutLink}>{aboutUsData.email}</CustomText>
                    </PressableScale>
                  </View>

                  <View style={styles.aboutSection}>
                    <CustomText style={styles.aboutSectionTitle} bold>Legal</CustomText>
                    <PressableScale
                      onPress={() => {
                        conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        navigation.navigate('Legal', { type: 'privacy' });
                      }}
                      pressedScale={0.98}
                    >
                      <CustomText style={styles.aboutLink}>Privacy Policy</CustomText>
                    </PressableScale>
                    <PressableScale
                      onPress={() => {
                        conditionalHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        navigation.navigate('Legal', { type: 'tos' });
                      }}
                      pressedScale={0.98}
                    >
                      <CustomText style={styles.aboutLink}>Terms of Service</CustomText>
                    </PressableScale>
                  </View>
                </View>
              </ScrollView>
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
                          background: theme.colorBottomSheetDark
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
                          background: theme.colorBottomSheetDark
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
              <AnimatedButton
                label='Cancel'
                onPress={handleCloseEditAccountModal}
                semibold
                variant='gray'
                style={styles.editAccountButton}
                contentContainerStyle={{
                  paddingVertical: 6,
                  borderRadius: 20
                }}
                textStyle={styles.editAccountCancelButtonText}
              />
              <AnimatedButton
                label='Save Changes'
                onPress={() => handleSubmit(onSubmit)()}
                semibold
                variant='red'
                style={styles.editAccountButton}
                contentContainerStyle={{
                  paddingVertical: 6,
                  borderRadius: 20
                }}
                textStyle={styles.editAccountSaveChangesButtonText}
              />
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
              <AnimatedButton
                label='Cancel'
                onPress={toggleLogoutConfirmation}
                semibold
                variant='gray'
                style={styles.logoutAccountConfirmationButton}
                contentContainerStyle={{
                  paddingVertical: 6,
                  borderRadius: 20
                }}
                textStyle={styles.logoutAccountCancelButtonText}
              />
              <AnimatedButton
                label='Log Out'
                onPress={handleLogout}
                semibold
                variant='red'
                style={styles.logoutAccountConfirmationButton}
                contentContainerStyle={{
                  paddingVertical: 6,
                  borderRadius: 20
                }}
                textStyle={styles.logoutAccountDeleteButtonText}
              />
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
              <AnimatedButton
                label='Cancel'
                onPress={toggleDeleteConfirmation}
                semibold
                variant='gray'
                style={styles.deleteAccountConfirmationButton}
                contentContainerStyle={{
                  paddingVertical: 6,
                  borderRadius: 24
                }}
                textStyle={styles.deleteAccountCancelButtonText}
              />
              <AnimatedButton
                label={canDelete ? 'Yes, Delete' : countdown.toString()}
                onPress={handleDeleteAccount}
                loading={deleteAccountLoading}
                disabled={!canDelete}
                variant='red'
                semibold
                style={{
                  ...styles.deleteAccountConfirmationButton,
                  ...(!canDelete && { opacity: 0.3 })
                }}
                contentContainerStyle={{
                  paddingVertical: 6,
                  borderRadius: 24
                }}
                textStyle={styles.deleteAccountDeleteButtonText}
              />
            </View>
          </PaperModal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView >
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
    fontSize: 28,
    lineHeight: 28
  },
  emailText: {
    fontSize: 12,
    color: theme.colorLightGray
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
    backgroundColor: theme.colorBottomSheetDark,
    padding: 16
  },
  bottomSheetButtonStyle: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
    elevation: 5
  },
  buttonTextStyle: {
    color: theme.colorFontDark,
    textAlign: "center"
  },
  deleteAccountBtnText: {
    color: theme.colorFontLight,
    textAlign: "center"
  },
  editAccountConfirmationContainer: {
    backgroundColor: theme.colorBottomSheetDark,
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
    paddingBottom: 3
  },
  editAccountButton: {
    flex: 1,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 1,
    paddingVertical: 6,
    borderRadius: 20
  },
  editAccountCancelButtonText: {
    color: theme.colorFontLight,
    fontSize: 14
  },
  editAccountSaveChangesButtonText: {
    color: theme.colorFontLight,
    fontSize: 14
  },
  logoutAccountConfirmationContainer: {
    backgroundColor: theme.colorBottomSheetDark,
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
    fontSize: 20
  },
  logoutAccountConfirmationMessage: {
    color: theme.colorLightGray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
    width: "90%"
  },
  logoutAccountButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  logoutAccountConfirmationButton: {
    flex: 1,
    paddingTop: 4,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center'
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
    backgroundColor: theme.colorBottomSheetDark,
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
    fontSize: 20
  },
  deleteAccountConfirmationMessage: {
    color: theme.colorLightGray,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 14,
    width: "85%"
  },
  deleteAccountButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  deleteAccountConfirmationButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  deleteAccountCancelButtonText: {
    fontSize: 14,
    color: theme.colorWhite
  },
  deleteAccountDeleteButtonText: {
    fontSize: 14,
    color: theme.colorFontLight
  },
  aboutUsContainer: {
    width: "100%",
    maxWidth: 450,
    marginHorizontal: "auto"
  },
  aboutHeader: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colorGray,
    marginHorizontal: "auto"
  },
  aboutLogo: {
    fontFamily: "DreamAvenue",
    fontSize: 48,
    color: theme.colorTabBarTint,
    marginBottom: 12
  },
  aboutMission: {
    fontSize: 15,
    color: theme.colorLightGray,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 24,
    marginBottom: 2
  },
  aboutSection: {
    marginTop: 20
  },
  aboutSectionTitle: {
    fontSize: 16,
    color: theme.colorFontLight,
    marginBottom: 2
  },
  aboutSectionVersion: {
    fontSize: 15,
    color: theme.colorFontGray
  },
  aboutSectionContent: {
    fontSize: 15,
    color: theme.colorFontGray,
    textDecorationLine: 'underline'
  },
  aboutLink: {
    fontSize: 15,
    color: theme.colorFontGray,
    textDecorationLine: 'underline'
  }
});