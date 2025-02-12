import axios from "axios";

export const API_URL = "http://192.168.239.200:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
