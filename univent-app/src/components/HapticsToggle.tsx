import * as Haptics from "expo-haptics";
import CustomText from "./CustomText";
// @ts-ignore
import SwitchSelector from "react-native-switch-selector";
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, StyleSheet } from 'react-native';
import { useHaptics } from '../context/HapticsContext';
import { updateHapticsEnabled } from '../utils/haptics';
import { theme } from "../../theme";
import { Image } from "expo-image";
import { Menu, MenuOption, MenuOptions, MenuTrigger, renderers } from "react-native-popup-menu";

const { Popover } = renderers;

const HapticsToggle = () => {
  const { hapticsEnabled, setHapticsEnabled } = useHaptics();

  const popOverData = {
    title: "Haptic preference",
    description: "Turn this off if you don't want vibrations, for comport, focus or battery. Only affects Univent and can be changed anytime.",
    note: "Doesn't change your phone's system settings."
  };

  const handleToggle = (value: boolean) => {
    setHapticsEnabled(value);
    updateHapticsEnabled(value);

    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
  };

  const options = [
    { label: 'Enable', value: true },
    { label: 'Disable', value: false }
  ];

  const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  return (
    <View style={styles.hapticsContainer}>
      <Image
        source={require("../../assets/icons/vibrate.png")}
        style={styles.iconVibrate}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />
      <CustomText style={styles.hapticsLabel} semibold>Haptics</CustomText>
      <SwitchSelector
        options={options}
        initial={hapticsEnabled ? 0 : 1}
        onPress={handleToggle}
        textColor={theme.colorFontLight}
        selectedColor={theme.colorFontDark}
        buttonColor={theme.colorTabBarTint}
        borderColor={theme.colorGray}
        borderWidth={1}
        backgroundColor={theme.colorSlightDark}
        hasPadding
        valuePadding={1}
        animationDuration={300}
        height={46}
        fontSize={13}
        bold
        style={styles.switchSelector}
        textStyle={styles.switchText}
        selectedTextStyle={styles.selectedSwitchText}
      />
      <Menu
        renderer={Popover}
        rendererProps={{
          placement: 'left',
          backgroundColor: theme.colorSlightDark
        }}
      >
        <MenuTrigger>
          <Ionicons
            name="information-circle-sharp"
            size={22}
            color={theme.colorTransparentLightGray}
            style={styles.hapticsInfoIcon}
          />
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsContainer: {
              backgroundColor: theme.colorSlightDark,
              borderRadius: 16,
              paddingVertical: 10,
              paddingHorizontal: 16,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 8,
              shadowOffset: {
                width: 0,
                height: 2
              },
              elevation: 8
            },
            optionWrapper: {
              padding: 0
            }
          }}
        >
          <MenuOption disabled>
            <CustomText style={styles.popoverTitle} bold>{popOverData.title}</CustomText>
            <CustomText style={styles.popoverText}>{popOverData.description}</CustomText>
            <CustomText style={styles.popoverNote}>{popOverData.note}</CustomText>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  );
};

export default HapticsToggle;

const styles = StyleSheet.create({
  hapticsContainer: {
    backgroundColor: theme.colorSlightDark,
    justifyContent: 'space-between',
    marginHorizontal: "auto",
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 400,
    width: "100%",
    paddingVertical: 2,
    paddingLeft: 14,
    borderRadius: 24,
    marginTop: 2
  },
  iconVibrate: {
    width: 21,
    height: 21,
    marginTop: 2,
    marginRight: 10
  },
  hapticsLabel: {
    color: theme.colorFontLight,
    fontSize: 15,
    flex: 1,
    paddingLeft: 4
  },
  switchSelector: {
    width: 200,
    borderRadius: 24
  },
  switchText: {
    fontWeight: '600',
    opacity: 0.5
  },
  selectedSwitchText: {
    fontStyle: "italic",
    opacity: 1
  },
  hapticsInfoIcon: {
    opacity: 0.7,
    marginLeft: 8,
    marginRight: 10
  },
  popoverTitle: {
    color: theme.colorFontLight,
    fontSize: 13,
    marginBottom: 6
  },
  popoverText: {
    color: theme.colorLightGray,
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 8,
    maxWidth: 260
  },
  popoverNote: {
    color: theme.colorFontGray,
    fontSize: 10,
    lineHeight: 18,
    maxWidth: 260
  }
});