import { View, TouchableOpacity, Image, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import CustomText from '../components/CustomText';
import { theme } from '../../theme';
import { useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { API_URL } from '../../univent-backend/src/utils/api';
import { UserContext } from '../context/UserContext';
import { TextInput as TextInputPaper } from 'react-native-paper';

const AuthScreen = () => {
  const { setUser } = useContext(UserContext);

  const navigation = useNavigation<AuthScreenNavigationProp>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setsecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const showToastSuccess = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 1500,
      type: 'success',
      text1: 'Logged in succesfully!',
    });
  };

  // const showToastUserNotFound = () => {
  //   Toast.show({
  //     type: 'info',
  //     text1: 'This email is not registered with any account!',
  //   });
  // };

  const showToastFailure = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'error',
      text1: 'Wrong credentials!',
    });
  };

  const showToastFillFields = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'info',
      text1: 'Please fill in all fields'
    });
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing API connection...');
        const response = await fetch(`${API_URL}`);
        const data = await response.json();
        console.log('API test successful:', data);
      } catch (error) {
        console.error('API test failed: ', error);
      }
    };

    testConnection();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showToastFillFields();
      return;
    };

    setLoading(true);

    try {
      console.log('Request details: ', {
        url: `${API_URL}/auth/login`,
        // body: { email, password } --- uncomment for debug
        body: { email }
      });

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(`Response data: ${data.message}, ID: ${data.user.id}`);

      if (!response.ok) {
        console.log('Login failed: ', data);
        showToastFailure();
        setLoading(false);
        return;
      };

      // store token
      try {
        await AsyncStorage.setItem("authToken", data.token);
        setUser(data.user); // set user's data
      } catch (storageError) {
        console.log('Error storing token: ', storageError);
        showToastFailure();
        setLoading(false);
        return;
      };

      showToastSuccess();
      setLoading(false);
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

      showToastFailure();
      setLoading(false);
    } finally {
      setLoading(false);
    };
  };

  const showToastSomethingIsWrong = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 3000,
      type: 'error',
      text1: 'Something is wrong with the app!',
      text2: 'Please restart the app.',
    });
  };

  const handleGuestLogin = async () => {

    setLoading(true);

    try {
      const data = {
        user: {
          username: "Guest",
          email: "user.guest@univent.com"
        },
      };

      setUser(data.user);

      try {
        navigation.replace("Main");
      } catch (err) {
        console.error(err);
        showToastSomethingIsWrong();
      }
    } catch (err) {
      console.error(err);
      showToastSomethingIsWrong();
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
          <Image
            source={require('../../assets/logos/full-logo.png')}
            style={styles.logo}
          />
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
              theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorBackgroundDark } }}
              textColor={theme.colorFontLight}
              outlineStyle={{ borderRadius: 14 }}
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
              theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorBackgroundDark } }}
              textColor={theme.colorFontLight}
              outlineStyle={{ borderRadius: 14 }}
              secureTextEntry={secureTextEntry}
              right={
                <TextInputPaper.Icon
                  icon={secureTextEntry ? 'eye' : 'eye-off'}
                  onPress={() => setsecureTextEntry(!secureTextEntry)}
                />
              }
            />
          </View>
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
            ) : (
              <CustomText style={styles.loginBtnText}>Log in</CustomText>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestLoginBtn} onPress={handleGuestLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colorFontLight} style={styles.activityIndicator} />
            ) : (
              <CustomText style={styles.guestLoginBtnText}>Guest Login</CustomText>
            )}
          </TouchableOpacity>

          <View style={styles.newAccContainer}>
            <TouchableOpacity style={styles.signUpBtn} onPress={() => navigation.navigate('Signup')}>
              <CustomText style={styles.SignupBtnText}>Create new account</CustomText>
            </TouchableOpacity>
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
    backgroundColor: theme.colorBackgroundDark,
    paddingBottom: 30,
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: "contain",
    marginTop: -40,
    marginBottom: -10
  },
  input: {
    fontSize: 16,
    color: theme.colorFontLight,
  },
  inputContainer: {
    width: "85%",
    gap: 12,
  },
  activityIndicator: {
    paddingVertical: 3,
  },
  loginBtn: {
    marginTop: 14,
    backgroundColor: theme.colorTaskbarYellow,
    paddingVertical: 6,
    width: "85%",
    borderRadius: 20
  },
  loginBtnText: {
    color: theme.colorFontDark,
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: '700'
  },
  guestLoginBtn: {
    marginVertical: 14,
    backgroundColor: theme.colorSlightDark,
    paddingVertical: 6,
    width: "85%",
    borderRadius: 20
  },
  guestLoginBtnText: {
    color: theme.colorTaskbarYellow,
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: '700'
  },
  newAccContainer: {
    flex: 1,
    flexDirection: "column-reverse",
    marginBottom: 20,
    width: "85%",
  },
  signUpBtn: {
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colorTaskbarYellow,
    borderRadius: 20
  },
  SignupBtnText: {
    color: theme.colorTaskbarYellow,
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: '700'
  },
});

export default AuthScreen;
