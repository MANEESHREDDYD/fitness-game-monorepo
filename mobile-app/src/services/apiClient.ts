import axios from "axios";
import Config from "react-native-config";
import { store } from "../store";

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 8000
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().user.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { apiClient };
