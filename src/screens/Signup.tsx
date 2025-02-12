import { View, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, StyleSheet, Image, Platform, Keyboard, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import { api } from '../../univent-backend/src/utils/api';
import Toast from 'react-native-toast-message';

const Signup = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();

  const [nameFieldActive, setNameFieldActive] = useState(theme.colorTransparentLightGray);
  const [inputFieldActive, setInputFieldActive] = useState(theme.colorTransparentLightGray);
  const [passwordFieldActive, setPasswordFieldActive] = useState(theme.colorTransparentLightGray);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            <TextInput
              placeholder="Name"
              placeholderTextColor={theme.colorFontGray}
              style={[styles.inputField, { borderColor: nameFieldActive }]}
              keyboardType='default'
              autoCorrect={false}
              onFocus={() => setNameFieldActive(theme.colorFontLight)}
              onBlur={() => setNameFieldActive(theme.colorTransparentLightGray)}
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.colorFontGray}
              style={[styles.inputField, { borderColor: inputFieldActive }]}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              onFocus={() => setInputFieldActive(theme.colorFontLight)}
              onBlur={() => setInputFieldActive(theme.colorTransparentLightGray)}
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={theme.colorFontGray}
              secureTextEntry={true}
              autoCapitalize='none'
              autoCorrect={false}
              style={[styles.inputField, { borderColor: passwordFieldActive }]}
              onFocus={() => setPasswordFieldActive(theme.colorFontLight)}
              onBlur={() => setPasswordFieldActive(theme.colorTransparentLightGray)}
              value={password}
              onChangeText={(text) => setPassword(text)}
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
    gap: 12,
  },
  inputField: {
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colorFontLight,
    borderWidth: 1,
    borderColor: theme.colorLightGray,
    borderRadius: 12,
    paddingLeft: 14,
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