import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import CustomText from '../components/CustomText';
import { theme } from '../../theme';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '../components/useToast';
import { api } from '../utils/api';

const EmailSchema = z.object({
  email: z.string().regex(
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    "Invalid email format — use only lowercase letters, numbers, dots, and standard email symbols"
  )
});

type FormData = z.infer<typeof EmailSchema>;

const ForgottenPassword = ({ route }: { route: any }) => {
  const passedEmail = route.params?.email || '';
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

  const onSubmit = async (data: FormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await api.post("/auth/forgotPassword", data);
      showSuccess(2500, "Credentials sent via email");
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 404) {
        showError(2500, "No user found with this email", "Please check your email");
      } else if (status === 400) {
        showInfo(2500, "Please enter your email");
      } else {
        showError(2500, "Something went wrong", "Please try again");
      };
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

          <TouchableOpacity style={styles.continueBtn} onPress={handleSubmit(onSubmit)}>
            <LinearGradient
              colors={['rgb(210, 238, 255)', 'rgb(250, 250, 250)', 'rgb(210, 238, 255)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBackground}
            >
              <CustomText style={styles.continueBtnText} semibold>Continue</CustomText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

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
    marginVertical: 14
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
  },
});