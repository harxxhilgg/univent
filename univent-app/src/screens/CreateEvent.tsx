import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomText from "../components/CustomText";
import ToggleSwitch from "toggle-switch-react-native";
import AnimatedButton from "../components/AnimatedButton";
import React, { useContext, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View, TouchableOpacity } from "react-native";
import { theme } from "../../theme";
import { Image } from "expo-image";
import { TextInput as TextInputPaper } from "react-native-paper";
import { FontAwesome6, Octicons } from "@expo/vector-icons";
import { UserContext } from "../context/UserContext";
import { api } from "../utils/api";
import { useNavigation } from "@react-navigation/native";
import { AuthScreenNavigationProp } from "../../App";
import { useToast } from "../components/useToast";

const isDev = __DEV__;

const CreateEvent = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation<AuthScreenNavigationProp>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventTime, setEventTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, showInfo } = useToast();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // 2025-03-12
      setEventDate(formattedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0"); // 18
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0"); // 27
      const seconds = "00";
      setEventTime(`${hours}:${minutes}:${seconds}`);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); // take media perms

    if (status !== "granted") {
      showError(2500, "Media access denied!", "Please allow media access from your device settings."); // if perms denied, show the error
      return; // terminate
    };

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // other options as well liveimages or videos
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7, // image compress, on iOS, .bmp and .png, then this will be ignored, on Android, it works for all file types
    });

    if (!result.canceled) {
      // result.assets[0] for log

      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!uri) return null;

    const formData = new FormData();
    const fileName = uri.split("/").pop() || "event-image.jpg";
    const fileType = `image/${fileName.split(".").pop()}` || `image/jpeg`;

    formData.append("image", {
      uri,
      name: fileName,
      type: fileType
    } as any);

    const response = await api.post("/events/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response?.data?.imageUrl || null;
  };


  const handleEventCreate = async () => {
    if (!title || !organizer || !eventDate || !eventTime || !location || !selectedImage || isPaid === undefined) {
      showInfo(2500, "Please fill in all fields!");
      return;
    };
    setLoading(true);

    try {
      const imageUrl = await uploadImage(selectedImage);
      const eventData = {
        title,
        organizer,
        eventDate,
        eventTime,
        location,
        imageUrl: imageUrl || null,
        isPaid,
        created_by_email: user?.email || "usersemailwillbehere@example.com",
      };
      if (isDev) console.log("event data: ", eventData);

      const response = await api.post("/events/create", eventData);
      if (isDev) console.log(response?.data);
      showSuccess(1500, "Event created successfully!");

      setTitle("");
      setOrganizer("");
      setEventDate("");
      setEventTime("");
      setLocation("");
      setSelectedImage(null);
      setIsPaid(false);
    } catch (err: any) {
      if (isDev) console.log("Event creation error ", err.response?.data || err.message);
      showError(2500, "Event created failure!");
    } finally {
      setLoading(false);
    };
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flexContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

          {user?.email === 'user.guest@univent.com' ? (
            <View style={styles.guestContainer}>
              <Octicons name="blocked" size={100} color={theme.colorRed} style={styles.accessDenyIcon} />
              <View style={styles.guestAccountTextContainer}>
                <CustomText style={[styles.textWhite, styles.guestAccessTitleText]} bold>Feature Unavailable</CustomText>
                <CustomText style={styles.textWhite} semibold>Guest users cannot create event.</CustomText>
                <CustomText style={styles.textWhite}>
                  Please either
                  <CustomText style={styles.inlineBtn} onPress={() => navigation.replace("Auth")} bold> log in </CustomText>
                  or
                  <CustomText style={styles.inlineBtn} onPress={() => navigation.replace("Signup")} bold> sign up </CustomText>
                  to create your own event.
                </CustomText>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>

                <TextInputPaper
                  keyboardType="email-address"
                  label="Email"
                  value={user?.email || "usersemailwillbehere@example.com"}
                  editable={false}
                  selectTextOnFocus={false}
                  style={styles.input}
                  mode="outlined"
                  theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorBackgroundDark } }}
                  textColor={theme.colorFontLight}
                  outlineStyle={{ borderRadius: 12 }}
                />

                <View style={styles.infoTextConatiner}>
                  <View style={styles.verticalCenterContainer}>
                    <FontAwesome6 name="circle-exclamation" size={18} color={theme.colorGreen} />
                  </View>
                  <CustomText style={styles.userEmailText} semibold>This email will be used for event creation</CustomText>
                </View>

                <TextInputPaper
                  keyboardType="default"
                  label="Title"
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={styles.input}
                  mode="outlined"
                  theme={{ colors: { primary: theme.colorTabBarTint, background: theme.colorBackgroundDark } }}
                  textColor={theme.colorFontLight}
                  outlineStyle={{ borderRadius: 10 }}
                  multiline={true}
                  numberOfLines={2}
                />

                <TextInputPaper
                  keyboardType="default"
                  label="Organizer"
                  value={organizer}
                  onChangeText={(text) => setOrganizer(text)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={styles.input}
                  mode="outlined"
                  theme={{ colors: { primary: theme.colorTabBarTint, background: theme.colorBackgroundDark } }}
                  textColor={theme.colorFontLight}
                  outlineStyle={{ borderRadius: 10 }}
                />

                <View style={styles.pickerContainer}>
                  {/* Date */}
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTimeInput}>
                    <CustomText style={styles.input}>{eventDate || "Select Date"}</CustomText>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={eventDate ? new Date(eventDate) : new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "calendar"}
                      onChange={handleDateChange}
                    />
                  )}

                  {/* Time */}
                  <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateTimeInput}>
                    <CustomText style={styles.input}>{eventTime || "Select Time"}</CustomText>
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      value={
                        eventDate
                          ? new Date(`${eventDate}T${eventTime || '00:00:00'}`)
                          : new Date()
                      }
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "clock"}
                      onChange={handleTimeChange}
                    />
                  )}
                </View>

                <TextInputPaper
                  keyboardType="default"
                  label="Location"
                  value={location}
                  onChangeText={(text) => setLocation(text)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={styles.input}
                  mode="outlined"
                  theme={{ colors: { primary: theme.colorTabBarTint, background: theme.colorBackgroundDark } }}
                  textColor={theme.colorFontLight}
                  outlineStyle={{ borderRadius: 10 }}
                />

                <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.image}
                      contentFit="cover"
                      cachePolicy='memory-disk'
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <Ionicons name="image" size={30} color={theme.colorLightGray} />
                      <CustomText style={styles.placeholderText}>Select image</CustomText>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.toggleContainer}>
                  <CustomText style={styles.toggleLabel}>Is event paid?</CustomText>
                  <ToggleSwitch
                    isOn={isPaid}
                    offColor={theme.colorSlightDark}
                    labelStyle={{ color: theme.colorFontLight, fontWeight: 'bold' }}
                    size='medium'
                    onToggle={(isOn) => setIsPaid(isOn)}
                  />
                </View>
              </View>
              <View style={styles.createEventContainer}>
                <AnimatedButton
                  label='Create Event'
                  onPress={handleEventCreate}
                  loading={loading}
                  disabled={loading}
                  variant="primary"
                  fullWidth
                  semibold
                  style={styles.submitBtn}
                  textStyle={styles.submitBtnText}
                />
              </View>
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CreateEvent;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme.colorBackgroundDark,
    alignItems: "center",
    paddingBottom: 130
  },
  guestContainer: {
    top: "30%",
    alignItems: "center"
  },
  accessDenyIcon: {
    marginBottom: 24
  },
  guestAccountTextContainer: {
    width: "70%",
    maxWidth: 300
  },
  guestAccessTitleText: {
    fontSize: 24,
    marginBottom: 18
  },
  textWhite: {
    color: theme.colorFontLight,
    textAlign: "center",
    fontSize: 14
  },
  inlineBtn: {
    fontSize: 14,
    color: theme.colorRed,
    textShadowColor: theme.colorRed,
    textShadowOffset: {
      width: 0,
      height: 0
    },
    textShadowRadius: 20
  },
  inputContainer: {
    marginTop: Platform.OS === 'web' ? "2%" : "0%",
    width: "95%",
    maxWidth: 500,
    padding: 6,
    gap: 4
  },
  infoTextConatiner: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: theme.colorDarkGreen,
    borderWidth: 1,
    borderColor: theme.colorGreen,
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8
  },
  verticalCenterContainer: {
    justifyContent: 'center'
  },
  userEmailText: {
    color: theme.colorGreen,
    fontSize: 13
  },
  input: {
    fontSize: 16,
    color: theme.colorFontGray
  },
  pickerContainer: {
    marginTop: 6,
    gap: 8
  },
  dateTimeInput: {
    borderWidth: 1,
    borderColor: theme.colorTransparentLightGray,
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark
  },
  imageContainer: {
    marginTop: 8,
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: theme.colorBackgroundDark,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colorTransparentLightGray,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center"
  },
  placeholderText: {
    color: theme.colorLightGray,
    fontSize: 14,
    marginTop: 5
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 10,
    marginTop: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colorTransparentLightGray,
    borderRadius: 10
  },
  toggleLabel: {
    color: theme.colorFontLight,
    fontSize: 16
  },
  createEventContainer: {
    display: "flex",
    marginTop: "auto",
    width: "92%",
    maxWidth: 500
  },
  submitBtn: {},
  submitBtnText: {
    color: theme.colorFontDark,
    textAlign: "center",
    letterSpacing: 1
  }
});
