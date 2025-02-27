import axios from "axios";

export const API_URL = "http://192.168.31.14:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
