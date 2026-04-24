import axios from "axios";
import Cookies from "js-cookie";

function normalizeApiBaseUrl(url) {
    if (!url) return "http://127.0.0.1:5000/api";
    const trimmed = String(url).trim().replace(/\/+$/, "");
    if (!trimmed) return "http://127.0.0.1:5000/api";
    if (trimmed.endsWith("/api")) return trimmed;
    return `${trimmed}/api`;
}

const axiosInstance = axios.create({
    baseURL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),
});

// nambah token ke cookies
axiosInstance.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default axiosInstance;
