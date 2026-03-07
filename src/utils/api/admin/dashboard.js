import axiosInstance from "../../axios";

export async function getDashboard() {
    const res = await axiosInstance.get(`/orders/history`);
    return res.data;
}