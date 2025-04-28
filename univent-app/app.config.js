import 'dotenv/config';

const env = process.env.APP_ENV || 'dev';

require('dotenv').config({
  path: `.env.${env}`,
})

export default {
  expo: {
    name: "univent",
    slug: "univent",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/system/noBgColorText.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/system/noBgColorText.png",
      resizeMode: "contain",
      backgroundColor: "#080b12"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/system/noBgColorText.png",
        backgroundColor: "#080b12"
      },
      package: "com.univent.app"
    },
    web: {
      favicon: "./assets/system/favicon.png"
    },
    plugins: ["expo-font"],
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
