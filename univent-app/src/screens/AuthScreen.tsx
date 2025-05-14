import { View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Text } from 'react-native';
import CustomText from '../components/CustomText';
import { theme } from '../../theme';
import { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';
import { UserContext } from '../context/UserContext';
import { TextInput as TextInputPaper } from 'react-native-paper';
import { decodeJwtPayload } from '../context/UserProvider';
import { useToast } from '../components/useToast';
import { LinearGradient } from 'expo-linear-gradient';

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
  const { showSuccess, showError, showInfo } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showInfo(2500, 'Please fill in all fields.');
      return;
    };

    setLoginLoading(true);

    try {
      // console.log('Request details: ', { // ! DEBUG ONLY
      //   url: `${API_URL}/auth/login`,
      //   body: { email } // do not use password in production
      // });

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      // console.log(`Response data: ${data.message}, ID: ${data.user.id}`); // ! DEBUG ONLY

      if (!response.ok) {
        console.log('Login failed: ', data);
        showError(3000, 'Login failed', 'Please try again.');
        setLoginLoading(false);
        return;
      };

      // store token
      try {
        await AsyncStorage.setItem("authToken", data.token);
        const decoded = decodeJwtPayload(data.token);
        setUser({
          id: decoded.userId,
          username: decoded.username,
          email: decoded.email
        });
      } catch (storageError) {
        console.log('Error storing token: ', storageError);
        showError(2500, 'Something went wrong', 'please try again.');
        setLoginLoading(false);
        return;
      };

      showSuccess(1500, 'Logged in succesfully!');
      navigation.replace("Main");
    } catch (err) {
      console.error('Login error: ', {
        name: err instanceof Error ? err.name : 'Unknown',
        messsage: err instanceof Error ? err.message : 'Unknown error',
        fullError: err
      });

      // check network error
      if (err instanceof TypeError && err.message.includes('Network req failed')) {
        console.log('Network error detected. Please check:');
        console.log('1. Device and server are on same network');
        console.log('2. Server is running and accessfible');
        console.log('3. IP address is correct');
      };

      showError(3000, 'Wrong credentials');
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
        setGuestLoading(false);
      } catch (err) {
        console.error(err);
        showError(2500, "Something is wrong with the app", "Please restart the app");
      }
    } catch (err) {
      console.error(err);
      showError(2500, "Something is wrong with the app", "Please restart the app");
    } finally {
      setGuestLoading(false);
    }
  }

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
          <TouchableOpacity onPress={handleLogin} disabled={loginLoading} style={styles.loginBtnContainer}>
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
          <View style={styles.newAccContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.replace('Signup');
                setGuestLoading(true);
              }}
            >
              <LinearGradient
                colors={['rgb(250, 250, 250)', 'rgb(210, 238, 255)', 'rgb(250, 250, 250)']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBackground}
              >
                <CustomText style={styles.SignupBtnText} semibold>Create new Account</CustomText>
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
    width: "90%",
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
    width: "89%",
    maxWidth: 500
  },
  grettingText: {
    fontFamily: "ZenOldMincho",
    fontSize: 22,
    color: theme.colorFontLight
  },
  inputContainer: {
    width: "90%",
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
    width: "90%",
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
  newAccContainer: {
    flex: 1,
    flexDirection: "column-reverse",
    marginBottom: 10,
    width: "90%",
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
