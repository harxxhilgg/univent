import * as Haptics from "expo-haptics";
import AnimatedButton from '../components/AnimatedButton';
import CustomText from '../components/CustomText';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { theme } from '../../theme';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput } from 'react-native-paper';
import { useToast } from '../components/useToast';
import { api } from '../utils/api';
import { useState } from 'react';
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

type ForgottenPasswordRouteProp = RouteProp<RootStackParamList, 'ForgottenPassword'>;
type FormData = z.infer<typeof EmailSchema>;
type StatusHandler = {
  [key: number]: () => void;
};

const EmailSchema = z.object({
  email: z.string().regex(
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    "Invalid email format — use only lowercase letters, numbers, dots, and standard email symbols"
  )
});

const ForgottenPassword = ({ route: email }: { route: ForgottenPasswordRouteProp }) => {
  const passedEmail: string = email.params?.email || '';
  const [forgottenPasswordLoading, setForgottenPasswordLoading] = useState(false);
  const { showSuccess, showInfo, showError } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      email: passedEmail
    },
    resolver: zodResolver(EmailSchema)
  });

  function showResponse(response: any, status: number) {
    const message = response?.data?.message.toString().split('- ')[1];

    const statusHandler: StatusHandler = {
      200: () => showSuccess(3000, message), // success
      400: () => showInfo(4000, message), // no input value
      404: () => showInfo(4000, message), // no user
      500: () => showError(4000, message) // server error
    };

    const handler = statusHandler[status];

    if (handler) {
      handler();
    };
  };

  const onSubmit = async (data: FormData) => {
    try {
      setForgottenPasswordLoading(true);
      const response = await api.post("/auth/forgotPassword", data);
      const status = response?.status;

      // show response upon user interaction on 'Continue' button.
      showResponse(response, status);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      const status = error?.response?.status;

      // show response upon user interaction on 'Continue' button.
      showResponse(error?.response, status);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setForgottenPasswordLoading(false);
    };
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <CustomText style={styles.titleText} bold>Recover your password</CustomText>
          <CustomText style={styles.enterEmailText}>Enter your email address.</CustomText>
          <View style={styles.inputContainer}>
            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.email}
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
                    activeOutlineColor={theme.colorWhite}
                    autoCapitalize='none'
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
          <CustomText style={styles.grayedText}>You will receive an email from us which contains your credentials to get back into your account.</CustomText>
          <AnimatedButton
            label='Continue'
            onPress={handleSubmit(onSubmit)}
            loading={forgottenPasswordLoading}
            disabled={forgottenPasswordLoading}
            variant='primary'
            fullWidth
            semibold
            style={styles.continueBtn}
            textStyle={styles.continueBtnText}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgottenPassword;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: theme.colorBackgroundDark
  },
  container: {
    flex: 1,
    padding: 14,
    width: "100%",
    maxWidth: 500,
    marginHorizontal: "auto"
  },
  titleText: {
    color: theme.colorFontLight,
    fontSize: 22
  },
  enterEmailText: {
    color: theme.colorFontLight,
    fontSize: 16,
    marginTop: 4
  },
  inputContainer: {
    width: "100%",
    marginHorizontal: "auto",
    marginTop: 10,
    marginBottom: 8
  },
  input: {
    fontSize: 15,
  },
  errorText: {
    color: theme.colorRed,
    paddingHorizontal: 10,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18
  },
  grayedText: {
    color: theme.colorFontGray,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 6
  },
  continueBtn: {
    marginVertical: 12
  },
  gradientBackground: {
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
  },
  continueBtnText: {
    color: theme.colorFontDark,
    letterSpacing: 0.5
  }
});