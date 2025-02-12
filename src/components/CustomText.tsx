import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

interface CustomTextProps extends TextProps {
  bold?: boolean;
}

const CustomText: React.FC<CustomTextProps> = ({ bold, style, ...props }) => {
  return (
    <Text
      style={[
        styles.text,
        { fontFamily: bold ? "Lato-Bold" : "Lato-Regular" },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16, // default font size
    lineHeight: 26 // increased because text being overlapped
  },
});

export default CustomText;
