import { View, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, StyleSheet, Platform, Keyboard, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../../theme';
import CustomText from '../components/CustomText';
import { useNavigation } from '@react-navigation/native';
import { AuthScreenNavigationProp } from '../../App';
import { TextInput as TextInputPaper } from 'react-native-paper';
import { api } from '../utils/api';
import { useToast } from '../components/useToast';
import { Controller, useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';

const SignupSchema = z.object({
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
  ),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppcase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character")
});

type FormData = z.infer<typeof SignupSchema>;

const Signup = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { showError, showSuccess } = useToast();
  const [secureTextEntry, setsecureTextEntry] = useState(true);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setSignupLoading(true);
      const response = await api.post("/auth/signup", data);
      console.log(`User created: ${response.data.username}`);
      showSuccess(3000, 'Account created', 'Please log in');
      navigation.navigate('Auth');
    } catch (error: any) {
      console.error(error);
      showError(3000, 'Signup Failed', error.response?.data?.message || "Please try again");
    } finally {
      setSignupLoading(false);
    }
  };

  const redirectLogin = () => {
    try {
      setLoginLoading(true);
      navigation.replace('Auth')
    } catch (err) {
      console.error(err);
    } finally {
      setLoginLoading(false);
    };
  };

  const toggleSecureEntry = () => setsecureTextEntry(prev => !prev);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Univent</Text>
          </View>
          <View style={styles.grettingContainer}>
            <CustomText style={styles.grettingText}>Create your Account</CustomText>
          </View>
          <View style={styles.inputContainer}>
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
                        background: theme.colorBackgroundDark
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
                        background: theme.colorBackgroundDark
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

            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInputPaper
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.password}
                    secureTextEntry={secureTextEntry}
                    style={styles.input}
                    mode='outlined'
                    theme={{
                      colors: {
                        primary: theme.colorWhite,
                        background: theme.colorBackgroundDark
                      }
                    }}
                    textColor={theme.colorFontLight}
                    outlineStyle={{ borderRadius: 10 }}
                    right={
                      <TextInputPaper.Icon
                        icon={secureTextEntry ? 'eye' : 'eye-off'}
                        onPress={toggleSecureEntry}
                      />
                    }
                  />
                  {errors.password && (
                    <CustomText style={styles.errorText}>
                      {errors.password.message}
                    </CustomText>
                  )}
                </>
              )}
            />
          </View>
          <TouchableOpacity
            style={styles.SignupBtn}
            onPress={handleSubmit(onSubmit)}
            disabled={signupLoading}
          >
            <LinearGradient
              colors={['rgb(210, 238, 255)', 'rgb(250, 250, 250)', 'rgb(210, 238, 255)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBackground}
            >
              {signupLoading ? (
                <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
              ) : (
                <CustomText style={styles.SignupBtnText} semibold>Sign up</CustomText>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.oldAccContainer}>
            <TouchableOpacity onPress={redirectLogin} disabled={loginLoading}>
              <LinearGradient
                colors={['rgb(250, 250, 250)', 'rgb(210, 238, 255)', 'rgb(250, 250, 250)']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBackground}
              >
                {loginLoading ? (
                  <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                ) : (
                  <CustomText style={styles.LoginBtnText} semibold>Log in</CustomText>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <CustomText style={styles.alreadyUserText}>Already a user?</CustomText>
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
    width: "95%",
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
    marginBottom: 6
  },
  input: {
    fontSize: 15,
  },
  errorText: {
    color: theme.colorRed,
    paddingHorizontal: 10,
    fontSize: 13,
    marginTop: 0,
    marginBottom: 5
  },
  SignupBtn: {
    paddingVertical: 6,
    width: "95%",
    maxWidth: 500
  },
  gradientBackground: {
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
  },
  activityIndicator: {
    paddingVertical: 3
  },
  SignupBtnText: {
    color: theme.colorFontDark,
    letterSpacing: 0.5
  },
  oldAccContainer: {
    flex: 1,
    flexDirection: "column-reverse",
    marginBottom: 10,
    width: "95%",
    maxWidth: 500
  },
  LoginBtnText: {
    color: theme.colorFontDark,
    letterSpacing: 0.5
  },
  alreadyUserText: {
    color: theme.colorFontGray,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 5,
    letterSpacing: 0.5
  }
});

export default Signup