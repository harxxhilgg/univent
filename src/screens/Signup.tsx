import { View, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, StyleSheet, Image, Platform, Keyboard, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import { api } from '../../univent-backend/src/utils/api';
import Toast from 'react-native-toast-message';
import { TextInput as TextInputPaper } from 'react-native-paper';

const Signup = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFocused, setIsFocused] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setsecureTextEntry] = useState(true);

  const showToastFillFields = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'error',
      text1: 'Please fill in all fields',
    });
  };

  const showToastSignupSuccess = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'success',
      text1: 'Account created successfully!',
      text2: 'Please log in into your account.'
    });
  };

  const showToastSignupFailure = (error: any) => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'error',
      text1: 'Signup Failed!',
      text2: error.res?.data?.message || "Please try again."
    });
  };

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      showToastFillFields();
      return;
    };

    try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
      });
      console.log(response);

      showToastSignupSuccess();
      navigation.navigate('Auth');
    } catch (error: any) {
      console.error(error);
      showToastSignupFailure(error);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}>
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
              keyboardType="default"
              label="Username"
              value={username}
              onChangeText={(text) => setUsername(text)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorBackgroundDark } }}
              textColor={theme.colorFontLight}
              outlineStyle={{ borderRadius: 14 }}
            />
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
          <TouchableOpacity style={styles.SignupBtn} onPress={handleSignUp}>
            <CustomText style={styles.SignupBtnText}>Sign up</CustomText>
          </TouchableOpacity>
          <View style={styles.oldAccContainer}>
            <TouchableOpacity style={styles.LoginBtn} onPress={() => navigation.navigate('Auth')}>
              <CustomText style={styles.LoginBtnText}>Log in</CustomText>
            </TouchableOpacity>
            <CustomText style={styles.alreadyUserText}>Already a user?</CustomText>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

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
  inputContainer: {
    width: "85%",
    gap: 6
  },
  input: {
    fontSize: 16,
    color: theme.colorFontLight,
  },
  SignupBtn: {
    marginTop: 14,
    backgroundColor: theme.colorTaskbarYellow,
    paddingVertical: 6,
    width: "85%",
    borderRadius: 20
  },
  SignupBtnText: {
    color: theme.colorFontDark,
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: '700'
  },
  oldAccContainer: {
    flex: 1,
    flexDirection: "column-reverse",
    marginTop: 20,
    width: "85%",
  },
  LoginBtn: {
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colorTaskbarYellow,
    borderRadius: 20
  },
  LoginBtnText: {
    color: theme.colorTaskbarYellow,
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: '700'
  },
  alreadyUserText: {
    color: theme.colorFontGray,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 1
  }
});

export default Signup