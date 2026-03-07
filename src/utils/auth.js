import Cookies from "js-cookie";
import axiosInstance from "./axios";
import { jwtDecode } from "jwt-decode";

export const loginUser = async (data) => {
    const res = await axiosInstance.post("/login", data, {
        headers: { "Content-Type": "application/json" },
    });

    const { token } = res.data;

    Cookies.set("token", token, {
        expires: 1,
        sameSite: "strict",
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
        path: "/",
    });

    return res.data;
};

export const getToken = () => {
    return Cookies.get("token") || null;
};

export const getUser = () => {
    const token = getToken();
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
};

export const logoutUser = () => {
    Cookies.remove("token", { path: "/" });
};