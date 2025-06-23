import 'dotenv/config';

const env = process.env.APP_ENV || 'dev';

require('dotenv').config({
  path: `.env.${env}`,
})

export default {
  expo: {
    name: "Univent",
    slug: "univent",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/icons/splash-icon-light.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/icons/splash-icon-light.png",
      imageWidth: 200,
      resizeMode: "contain",
      backgroundColor: "#080b12"
    },
    ios: {
      supportsTablet: true,
      icon: {
        dark: "./assets/icons/ios-dark.png",
        light: "./assets/icons/ios-light.png",
        tinted: "./assets/icons/ios-tinted.png"
      },
      jsEngine: "hermes"
    },
    android: {
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: "./assets/icons/adaptive-icon.png",
        monochromeImage: "./assets/icons/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.univent.app",
      jsEngine: "hermes",
      googleServicesFile: "./google-services.json",
      notification: {
        icon: "./assets/icons/splash-icon-light.png",
        color: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/icons/favicon-32x32.png"
    },
    plugins: [
      "expo-font",
      [
        "expo-splash-screen",
        {
          image: "./assets/icons/splash-icon-light.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#080b12"
        }
      ],
      "expo-dev-client",
      "expo-notifications",
      "expo-task-manager"
    ],
    extra: {
      API_URL: process.env.API_URL,
      NODE_ENV: process.env.NODE_ENV,
      eas: {
        projectId: "ae9f7df3-dde8-4bf5-ac50-2908fa513010"
      }
    },
    owner: "harshil0"
  }
};
