import axios from "axios";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function imageUrl(relativeUrl) {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith("http")) return relativeUrl;
  return `${API_BASE_URL}${relativeUrl}`;
}

export function apiErrorMessage(error, fallback = "Não foi possível concluir a operação.") {
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;
