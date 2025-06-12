import { View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Text } from 'react-native';
import CustomText from '../components/CustomText';
import { theme } from '../../theme';
import { useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';
import { UserContext } from '../context/UserContext';
import { TextInput as TextInputPaper } from 'react-native-paper';
import { decodeJwtPayload } from '../context/UserProvider';
import { useToast } from '../components/useToast';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

type LoginFormData = {
  email: string;
  password: string;
};

const AuthScreen = () => {
  const { setUser } = useContext(UserContext);
  const navigation = useNavigation<AuthScreenNavigationProp>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setsecureTextEntry] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [GuestLoading, setGuestLoading] = useState(false);
  const [createNewAccountLoading, setCreateNewAccountLoading] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();
  const [failedAttempt, setFailedAttempt] = useState(false);

  const defaultForgottenPasswordSize = useSharedValue(12);

  useEffect(() => {
    defaultForgottenPasswordSize.value = withTiming(failedAttempt ? 14 : 13, { duration: 200 });
  }, [failedAttempt, defaultForgottenPasswordSize]);

  const animatedStyle = useAnimatedStyle(() => ({
    fontSize: defaultForgottenPasswordSize.value
  }))

  const onLoginSubmit = async (data: LoginFormData) => {
    const { email, password } = data;
    setLoginLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;

      // Store token and decode user data
      try {
        await AsyncStorage.setItem("authToken", token);
        const decoded = decodeJwtPayload(token);
        setUser({
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email,
        });
      } catch (storageError) {
        console.log("Error storing token: ", storageError);
        showError(2500, "Something went wrong", "Please try again");
        return;
      };

      showSuccess(1500, "Logged in successfully!");
      navigation.replace("Main");
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 400) {
        showInfo(2500, "Please fill in all fields");
      } else if (status === 401 || status === 403) {
        showError(3000, "Invalid credentials", "Please check your email and password.");
        setFailedAttempt(true);
      } else {
        const status = error.response?.status;

        if (status === 404) {
          showError(3000, "Incorrect or Invalid email address", "Please check your email and try again");
        } else {
          showError(3000, "Something went wrong", "Please try again");
        };
      };
    } finally {
      setLoginLoading(false);
    };
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      // setting up guest data
      const data = {
        user: {
          username: "Guest",
          email: "user.guest@univent.com"
        },
      };
      setUser(data.user);
      try {
        navigation.replace("Main");
        showSuccess(1500, 'Logged in as a guest!');
      } catch (err) {
        console.error(err);
        showError(2500, "Something is wrong with the app", "Please restart the app");
      }
    } catch (err) {
      console.error(err);
      showError(2500, "Something is wrong with the app", "Please restart the app");
    } finally {
      setGuestLoading(false);
    };
  };

  const redirectNewAccount = () => {
    try {
      setCreateNewAccountLoading(true);
      navigation.replace('Signup');
    } catch (err) {
      console.error(err);
    } finally {
      setCreateNewAccountLoading(false);
    };
  };

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
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Univent</Text>
          </View>
          <View style={styles.grettingContainer}>
            <CustomText style={styles.grettingText}>Login to your Account</CustomText>
          </View>
          <View style={styles.inputContainer}>
            <TextInputPaper
              keyboardType="email-address"
              autoCapitalize='none'
              label="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: theme.colorWhite, background: theme.colorBackgroundDark } }}
              textColor={theme.colorFontLight}
              outlineStyle={{ borderRadius: 10 }}
            />
            <TextInputPaper
              keyboardType="default"
              autoCapitalize='none'
              label="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: theme.colorWhite, background: theme.colorBackgroundDark } }}
              textColor={theme.colorFontLight}
              outlineStyle={{ borderRadius: 10 }}
              secureTextEntry={secureTextEntry}
              right={
                <TextInputPaper.Icon
                  icon={secureTextEntry ? 'eye' : 'eye-off'}
                  onPress={() => setsecureTextEntry(!secureTextEntry)}
                />
              }
            />
          </View>
          <TouchableOpacity onPress={() => onLoginSubmit({ email, password })} disabled={loginLoading} style={styles.loginBtnContainer}>
            <LinearGradient
              colors={['rgb(210, 238, 255)', 'rgb(250, 250, 250)', 'rgb(210, 238, 255)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBackground}
            >
              {loginLoading ? (
                <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
              ) : (
                <CustomText style={styles.loginBtnText} semibold>Log in</CustomText>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGuestLogin} disabled={GuestLoading} style={styles.loginBtnContainer}>
            <LinearGradient
              colors={['rgb(210, 255, 238)', 'rgb(255, 255, 255)', 'rgb(210, 255, 238)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBackground}
            >
              {GuestLoading ? (
                <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
              ) : (
                <CustomText style={styles.guestLoginBtnText} semibold>Guest Login</CustomText>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("ForgottenPassword", { email })}>
            <AnimatedText style={[animatedStyle, {
              color: theme.colorFontGray
            }]}>
              Forgotten Password?
            </AnimatedText>
          </TouchableOpacity>

          <View style={styles.newAccContainer}>
            <TouchableOpacity onPress={redirectNewAccount}>
              <LinearGradient
                colors={['rgb(250, 250, 250)', 'rgb(210, 238, 255)', 'rgb(250, 250, 250)']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBackground}
              >
                {createNewAccountLoading ? (
                  <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                ) : (
                  <CustomText style={styles.SignupBtnText} semibold>Create new Account</CustomText>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <CustomText style={styles.alreadyUserText}>New User?</CustomText>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark
  },
  logoContainer: {
    marginTop: 110,
    marginBottom: 90,
    width: "100%",
    alignItems: "center",
    maxWidth: 500
  },
  logo: {
    fontFamily: "DreamAvenue",
    fontSize: 60,
    color: theme.colorFontLight,
    userSelect: "none"
  },
  grettingContainer: {
    marginBottom: 14,
    width: "93%",
    maxWidth: 500
  },
  grettingText: {
    fontFamily: "ZenOldMincho",
    fontSize: 22,
    color: theme.colorFontLight
  },
  inputContainer: {
    width: "95%",
    maxWidth: 500,
    gap: 6,
    marginBottom: 12
  },
  input: {
    fontSize: 15
  },
  activityIndicator: {
    paddingVertical: 3
  },
  loginBtnContainer: {
    width: "95%",
    maxWidth: 500,
    marginBottom: 8
  },
  gradientBackground: {
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center"
  },
  loginBtnText: {
    color: theme.colorFontDark,
    letterSpacing: 0.5,
    fontSize: 15
  },
  guestLoginBtnText: {
    color: theme.colorFontDark,
    letterSpacing: 0.5,
    fontSize: 15
  },
  defaultAttempt: {
    fontSize: 12,
    color: theme.colorFontGray
  },
  failedAttempt: {
    fontSize: 14,
    color: theme.colorFontGray
  },
  newAccContainer: {
    flex: 1,
    flexDirection: "column-reverse",
    marginBottom: 10,
    width: "95%",
    maxWidth: 500
  },
  SignupBtnText: {
    color: theme.colorFontDark,
    letterSpacing: 0.5,
    fontSize: 15
  },
  alreadyUserText: {
    color: theme.colorFontGray,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 5,
    letterSpacing: 0.5
  }
});

export default AuthScreen;
