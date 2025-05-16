import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

interface CustomTextProps extends TextProps {
  bold?: boolean;
  semibold?: boolean;
  className?: string;
}

const CustomText: React.FC<CustomTextProps> = ({ bold, semibold, style, className, ...props }) => {
  return (
    <Text
      style={[
        styles.text,
        { fontFamily: bold ? "Inter-Bold" : semibold ? "Inter-SemiBold" : "Inter-Regular" },
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
