import axios from "axios";
import Constants from "expo-constants";

export const API_URL = Constants.expoConfig?.extra?.API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

console.log("API_URL: ", API_URL);
