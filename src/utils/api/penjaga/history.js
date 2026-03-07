import axiosInstance from "../../axios";

export async function getDailyHistory() {
    const res = await axiosInstance.get(`/orders/daily`);
    return res.data;
}

