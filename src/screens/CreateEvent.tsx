import React, { useContext, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from "react-native";
import CustomText from "../components/CustomText";
import { theme } from "../../theme";
import { Image } from "expo-image";
import { TextInput as TextInputPaper } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from "react-native-toast-message";
import ToggleSwitch from "toggle-switch-react-native";
import { UserContext } from "../context/UserContext";
import { API_URL } from "../../univent-backend/src/utils/api";
import { useNavigation } from "@react-navigation/native";
import { AuthScreenNavigationProp } from "../../App";

const { width } = Dimensions.get('window');

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

  const showToastPermissionDeny = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 3000,
      type: 'error',
      text1: 'Media access denied!',
      text2: 'Please allow media access for Expo Go from your device settings.'
    });
  };

  const showToastSuccess = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2000,
      type: 'success',
      text1: 'Event created!',
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

  const showToastFailure = () => {
    Toast.show({
      autoHide: true,
      visibilityTime: 2500,
      type: 'error',
      text1: 'Event Creation Failure',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setEventDate(formattedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      const seconds = "00";
      setEventTime(`${hours}:${minutes}:${seconds}`);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); // take media perms

    if (status !== "granted") {
      showToastPermissionDeny(); // if perms denied, show the error
      return; // terminate
    };

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // other options as well liveimages or videos
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7, // image compress, on iOS, .bmp and .png, then this will be ignored, on Android, it works for all file types
    });

    if (!result.canceled) {
      console.log(result.assets[0]); // CHECK THIS !!!
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      console.log("Selected image URI: ", imageUri);
    }
  };

  const uploadImage = async (uri: string) => {
    console.log("Uploading image with URI: ", uri);
    if (!uri) {
      console.log("No image URI provided, returning null");
      return null;
    };

    const formData = new FormData();
    const fileName = uri.split("/").pop() || "event-image.jpg";
    const fileType = `image/${fileName.split(".").pop()}` || `image/jpeg`;

    formData.append("image", {
      uri,
      name: fileName,
      type: fileType,
    } as any);

    const response = await fetch(`${API_URL}/events/upload`, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
      },
    });

    console.log("Upload response status:", response.status);
    const responseText = await response.text();
    console.log("Upload response text:", responseText);

    if (!response.ok) {
      console.log("Upload failed, returning null:", responseText);
      return null;
    }

    const data = JSON.parse(responseText);
    console.log("Upload response data:", data);

    return data.imageUrl || null;
  };

  const handleEventCreate = async () => {
    if (!title || !organizer || !eventDate || !eventTime || !location || !selectedImage || isPaid === undefined) {
      showToastFillFields();
      return;
    };

    setLoading(true);

    try {
      const imageUrl = await uploadImage(selectedImage);
      console.log("Image URL before sending to create: ", imageUrl);

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

      console.log("Req details: ", {
        url: `${API_URL}/events/create`,
        body: eventData
      });

      const response = await fetch(`${API_URL}/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(eventData),
      });

      console.log("Response status: ", response.status);
      console.log("Response headers: ", Object.fromEntries(response.headers.entries()));
      const responseText = await response.text();
      console.log("Response text: ", responseText);

      if (!response.ok) {
        console.log('Event creation failed: ', responseText);
        showToastFailure();
        return;
      };

      const data = JSON.parse(responseText);
      showToastSuccess();
      console.log("Created event ID: ", data.event.id);

      setTitle("");
      setOrganizer("");
      setEventDate("");
      setEventTime("");
      setLocation("");
      setSelectedImage(null);
      setIsPaid(false);
    } catch (err) {
      console.error('Event creation error: ', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        fullError: err
      });

      if (err instanceof TypeError && err.message.includes('Network req failed')) {
        console.log('Network error detected. Please check:');
        console.log('1. Device and server are on same network');
        console.log('2. Server is running and accessible');
        console.log('3. IP address is correct');
      };

      showToastFailure();
    } finally {
      setLoading(false);
    };
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flexContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

          {user.email === 'user.guest@univent.com' ? (
            <View style={styles.centerContainer}>
              <Image source={require('../../assets/logos/restriction.png')} style={styles.accessDenyIcon} />
              <CustomText style={[styles.textWhite, styles.guestAccessTitleText]}>Feature Unavailable</CustomText>
              <CustomText style={styles.textWhite}>Guest users cannot create events</CustomText>
              <CustomText style={styles.textWhite}>
                Please
                <CustomText style={styles.inlineBtn} onPress={() => navigation.replace("Auth")}> log in </CustomText>
                or
                <CustomText style={styles.inlineBtn} onPress={() => navigation.replace("Signup")}> sign up </CustomText>
                to create your own event
              </CustomText>
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
                  <MaterialCommunityIcons name="information-variant" size={24} color={theme.colorGreen} />
                  <CustomText style={styles.userEmailText}>This email will be used for event creation and this is uneditable.</CustomText>
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
                  theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorBackgroundDark } }}
                  textColor={theme.colorFontLight}
                  outlineStyle={{ borderRadius: 12 }}
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
                  theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorBackgroundDark } }}
                  textColor={theme.colorFontLight}
                  outlineStyle={{ borderRadius: 12 }}
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
                      value={new Date()}
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
                  theme={{ colors: { primary: theme.colorTaskbarYellow, background: theme.colorBackgroundDark } }}
                  textColor={theme.colorFontLight}
                  outlineStyle={{ borderRadius: 12 }}
                />

                <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.image}
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
                    onColor={theme.colorGreen}
                    offColor={theme.colorSlightDark}
                    labelStyle={{ color: theme.colorFontLight, fontWeight: 'bold' }}
                    size='medium'
                    onToggle={(isOn) => setIsPaid(isOn)}
                  />
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleEventCreate} disabled={loading} >
                  {loading ? (
                    <ActivityIndicator color={theme.colorFontDark} style={styles.activityIndicator} />
                  ) : (
                    <CustomText style={styles.submitBtnText}>Create form</CustomText>
                  )}
                </TouchableOpacity>

              </View>
              <View style={styles.emptyContainer}></View>
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
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark,
    paddingBottom: 30,
  },
  centerContainer: {
    width: width < 450 ? "90%" : "85%",
    top: "15%",
    alignItems: "center"
  },
  accessDenyIcon: {
    resizeMode: 'cover',
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  guestAccessTitleText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 50
  },
  textWhite: {
    color: theme.colorFontLight
  },
  inlineBtn: {
    color: theme.colorBrightRed,
    fontWeight: "bold"
  },
  inputContainer: {
    marginTop: "6%",
    width: "85%",
    padding: 6,
    gap: 10
  },
  infoTextConatiner: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: theme.colorDarkGreen,
    borderWidth: 0.5,
    borderColor: theme.colorGreen,
    padding: 8,
    gap: 2
  },
  userEmailText: {
    width: "90%",
    color: theme.colorGreen,
    fontSize: 13,
  },
  input: {
    fontSize: 16,
    color: theme.colorFontLight,
  },
  dateTimeInput: {
    borderWidth: 0.5,
    borderColor: theme.colorLightGray,
    padding: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorBackgroundDark,
  },
  pickerContainer: {
    marginTop: 4,
    gap: 14
  },
  imageContainer: {
    marginTop: 10,
    width: "100%",
    height: 150,
    borderRadius: 12,
    backgroundColor: theme.colorBackgroundDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colorLightGray,
    overflow: "hidden",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: theme.colorLightGray,
    fontSize: 14,
    marginTop: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 10,
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: theme.colorLightGray,
    borderRadius: 12,
    backgroundColor: theme.colorBackgroundDark,
  },
  toggleLabel: {
    color: theme.colorFontLight,
    fontSize: 16,
    fontWeight: 'bold'
  },
  submitBtn: {
    marginTop: 14,
    backgroundColor: theme.colorTaskbarYellow,
    paddingVertical: 6,
    width: "100%",
    borderRadius: 20
  },
  activityIndicator: {
    paddingVertical: 3,
  },
  submitBtnText: {
    color: theme.colorFontDark,
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: '700'
  },
  emptyContainer: {
    marginVertical: 100
  },
});
